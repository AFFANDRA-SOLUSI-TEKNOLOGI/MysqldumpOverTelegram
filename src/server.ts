import dotenv from "dotenv";
dotenv.config();

import path from "path";
import fs from "fs";
import cron from "node-cron";
import express from "express";
import mysqldump, { ConnectionOptions } from "mysqldump";

import { Telegraf, Context, Markup } from "telegraf";
import { TelegrafCommandHandler } from "telegraf-command-handler";
import { ConnectionConfig, createConnection } from "mysql";
import { QuickDB, JSONDriver } from "quick.db";

import { registerBotCommands } from "./utils/registerBotCommands";
import { createLog } from "./utils/logs";
import { config } from "./config";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.locale(config.dayjs.locale);
dayjs.extend(utc);
dayjs.extend(timezone);

const bot = new Telegraf(config.telegram.bot_token);
const jsonDriver = new JSONDriver();
const db = new QuickDB({ driver: jsonDriver });
const app = express();

const main = (database: DatabaseConfig) => {
  const connectionConfig = {
    host: database.host || "127.0.0.1",
    user: database.user,
    password: database.password,
    database: database.name,
    port: database.port || 3306,
  };

  const dateNow = dayjs().tz(config.timezone);
  const formattedDate = dateNow.format(config.dayjs.format);
  const backupFilename = `${database.name} ${formattedDate}.sql`;
  const backupPath = path.join(__dirname, "tmp", database.name);
  const dumpPath = `${backupPath}/${backupFilename}`;

  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }

  const connection = createConnection(connectionConfig as ConnectionConfig);

  connection.connect((error) => {
    if (error) {
      console.error(`Error connecting to ${database.name}: ${error}`);
      return;
    }

    connection.query("SHOW DATABASES", async (error, results) => {
      if (error) {
        console.error(`Error querying databases for ${database.name}: ${error}`);
        connection.destroy();
        return;
      }

      const databaseNames = results.map((result: any) => result.Database);
      if (databaseNames.includes(database.name)) {
        try {
          await mysqldump({
            connection: connectionConfig as ConnectionOptions,
            dumpToFile: dumpPath,
          });

          let sendToTelegram = await bot.telegram.sendDocument(config.telegram.chat_id, {
            source: fs.createReadStream(dumpPath),
            filename: backupFilename,
          });

          await db.push(`${dateNow.format("DD/MM/YY")}.${connectionConfig.database}`, sendToTelegram.message_id);
          fs.rmSync(dumpPath);

          if (config.logs) {
            createLog({
              date: formattedDate,
              name: backupFilename,
            });
          }

          connection.end();
        } catch (err) {
          console.error(err);
          connection.end();
        }
      } else {
        console.error(`Database ${database.name} not found.`);
        connection.end();
      }
    });
  });
};

cron.schedule(config.cron, async () => {
  console.log("Starting cron job...");
  const databases = await db.get("databases");

  databases.forEach((database: DatabaseConfig) => {
    main(database);
  });
}, {
  scheduled: true,
  timezone: config.timezone
});

bot.use(async (ctx: Context, next) => {
  if (!ctx.from) return;

  if (!config.telegram.whitelisted_user_id.includes(ctx.from.id.toString())) return ctx.reply(`👀`);
  next();
});

const CommandHandler = new TelegrafCommandHandler({ path: path.resolve() + "/dist/commands" });
bot.use(CommandHandler.load());

bot.action(/.+/, async (ctx) => {
  let text = ctx.match[0];
  let args = text.split(" ");
  let action = args[0];
  args.shift();

  let dbs = await db.get("databases");
  if (action === "backup") {
    ctx.answerCbQuery(`dumping ${args[0]}...`);
    if (!args.length) return ctx.answerCbQuery("argument needed.");
    let wantToDump = dbs.find((x: any) => x.name === args[0]);
    await main(wantToDump);
    return ctx.reply("Yay! you should get the dump file in your channel or get it with /get command.");
  }

  if (action === "delete") {
    ctx.answerCbQuery(`deleting ${args[0]}...`);
    if (!args.length) return ctx.answerCbQuery("argument needed.");
    let wantToDelete = dbs.find((x: any) => x.name === args[0]);
    await db.pull("databases", (x: any) => x.name === wantToDelete.name);
    return ctx.editMessageText("Deleted!", { ...Markup.inlineKeyboard([]) });
  }
});

app.get("/", (req, res) => res.sendStatus(200));
app.listen(process.env.PORT, () => console.log("App listening on port", process.env.PORT));

registerBotCommands();
bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

export { db, CommandHandler, bot };
