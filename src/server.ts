import dotenv from "dotenv";
dotenv.config();

import path from "path";
import fs from "fs";
import cron from "node-cron";
import mysqldump, { ConnectionOptions } from "mysqldump";

import { Telegraf, Context } from "telegraf";
import { ConnectionConfig, createConnection } from "mysql";
import { QuickDB, JSONDriver } from "quick.db";

import { createLog } from "./utils/logs";
import { config } from "./config";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.locale(config.dayjs.locale);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(config.dayjs.timezone);

const bot = new Telegraf(config.telegram.bot_token);
const jsonDriver = new JSONDriver();
const db = new QuickDB({ driver: jsonDriver });

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

cron.schedule(config.cron, async() => {
  console.log("Starting cron job...");
  const databases = await db.get('databases');

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

bot.command("new", async (ctx) => {
  let args = ctx.update.message.text.split(" ");
  args.shift();

  const [name, host, port, user, password] = args;

  if(!name || !host || !port || !user || !password) return ctx.reply("usage: /new db_name db_host db_port db_username db_password\n\n* empty password? just use %empty%");

  const get = await db.get('databases');
  if(get && get.find((x: any) => x.name === name)) return ctx.reply("Databases already exists!");

  await db.push('databases', { name, host, port, user, password: password === "%empty%" ? "" : password });
  ctx.reply("Successfully added!");
});

bot.command("edit", async (ctx) => {
  let args = ctx.update.message.text.split(" ");
  args.shift();

  let [name, type, new_value] = args;
  const types = "name, host, port, user, password";

  if(!name || !type || !new_value || !types.split(", ").includes(type)) return ctx.reply(`usage: /edit db_name type new_value\n\n- Available types: ${types}.`);

  let get = await db.get('databases');
  let database = get.find((x: any) => x.name === name);
  if(!database) return ctx.reply("Database doesn't exists!");

  let edited: any = {
    name: database.name,
    host: database.host,
    port: database.port,
    user: database.username,
    password: database.password
  }

  if(new_value === "%empty%") new_value = "";
  edited[type] = new_value;

  await db.pull('databases', (x: any) => x.name === database.name);
  await db.push('databases', edited);
  ctx.reply("Successfully edited!");
});

bot.command("list", async (ctx) => {
  let get = await db.get('databases');
  let arr: any = [];

  if(!get.length) return ctx.reply('empty');

  get.map((x: any) => arr.push(x.name));
  ctx.reply(arr.join(", "));
})

bot.command("view", async (ctx) => {
  let args = ctx.update.message.text.split(" ");
  args.shift();

  if(!args.length) return ctx.reply("argument needed!");
  let get = await db.get('databases');
  let database = get.find((x: any) => x.name === args[0]);
  if(!database) return ctx.reply("Database doesn't exists!");

  ctx.reply(`Name: ${database.name}\nHost: ${database.host}:${database.port}\nUser: ${database.user}\nPassword: ${database.password}`);
});

bot.command("delete", async (ctx) => {
  let args = ctx.update.message.text.split(" ");
  args.shift();

  if(!args.length) return ctx.reply("argument needed!");
  let get = await db.get('databases');
  let database = get.find((x: any) => x.name === args[0]);
  if(!database) return ctx.reply("Database doesn't exists!");

  await db.pull('databases', (x: any) => x.name === database.name);
  ctx.reply("Deleted!");
})

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
