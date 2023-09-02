import dotenv from "dotenv";
dotenv.config();

import path from "path";
import fs from "fs";
import cron from "node-cron";
import mysqldump, { ConnectionOptions } from "mysqldump";

import { Telegraf, Context } from "telegraf";
import { ConnectionConfig, createConnection } from "mysql";
import { QuickDB } from "quick.db";

import { createLog } from "./utils/logs";
import { config, databases } from "./config";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.locale(config.dayjs.locale);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(config.dayjs.timezone);

const bot = new Telegraf(config.telegram.bot_token);
const db = new QuickDB();

const main = (database: DatabaseConfig) => {
  const connectionConfig = {
    host: database.host || "127.0.0.1",
    user: database.user,
    password: database.password,
    database: database.name,
    port: database.port || 3306,
  };

  const dateNow = dayjs();
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

          await db.set(`${dateNow.format("DD/MM/YY")}.${connectionConfig.database}`, sendToTelegram.message_id);
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

cron.schedule(config.cron, () => {
  console.log("Starting cron job...");
  databases.forEach((database: DatabaseConfig) => {
    main(database);
  });
});

bot.use(async (ctx: Context, next) => {
  if (!ctx.from) return;

  if (!config.telegram.whitelisted_user_id.includes(ctx.from.id.toString())) return ctx.reply(`👀`);
  next();
});

bot.start((ctx) => ctx.reply("Hello World"));

bot.command("get", async (ctx) => {
  let args = ctx.update.message.text.split(" ");
  args.shift();

  if (args.length < 2) return ctx.reply("needed args: DD/MM/YY databasename");

  let messageId = await db.get(`${args[0]}.${args[1]}`);
  if (!messageId) return ctx.reply("Can't get message id from database!");

  ctx.telegram.forwardMessage(ctx.from.id, config.telegram.chat_id, messageId);
});

bot.command("logs", async (ctx) => {
  if (!config.logs) return ctx.reply("Logs system are disabled.");
  let args = ctx.update.message.text.split(" ");
  args.shift();

  if (!args.length) return ctx.reply("logs name is required!");

  try {
    const logContent = fs.readFileSync(`./logs/${args[0]}/logs-${args[0]}.log`, { encoding: "utf-8" });
    return ctx.reply(logContent);
  } catch (error) {
    return ctx.reply(`No such ${args[0]} log file were found.`);
  }
});

bot.launch().then(() => console.log("Bot ready!"));

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
