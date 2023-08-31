require("dotenv").config();

const path = require("path");
const fs = require("fs");

const mysql = require("mysql");
const mysqldump = require('mysqldump');
const cron = require("node-cron");
const { config, databases } = require("./config.js");

const { QuickDB } = require("quick.db");
const db = new QuickDB(); 

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.locale(config.dayjs.locale);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(config.dayjs.timezone);

const { Telegraf } = require('telegraf');
const bot = new Telegraf(config.telegram.bot_token);

const backupDatabase = (database) => {
  const connectionConfig = {
    host: database.host || "localhost",
    user: database.user,
    password: database.password,
    database: database.name,
    port: database.port || 3306
  }

  const dateNow = dayjs();
  const formattedDate = dateNow.format(config.dayjs.format);
  const backupFilename = `${database.name} ${formattedDate}.sql`;
  const backupPath = path.join(__dirname, "tmp", database.name);
  const dumpPath = `${backupPath}/${backupFilename}`;

  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }

  const connection = mysql.createConnection(connectionConfig);

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

      const databaseNames = results.map((result) => result.Database);
      if (databaseNames.includes(database.name)) {
        try {
          await mysqldump({
            connection: connectionConfig,
            dumpToFile: dumpPath,
          });
  
          let sendToTelegram = await bot.telegram.sendDocument(config.telegram.chat_id, {
            source: fs.createReadStream(dumpPath),
            filename: backupFilename
          });

          await db.set(`${dateNow.format('DD/MM/YY')}.${connectionConfig.database}`, sendToTelegram.message_id);
          await fs.rmSync(dumpPath);

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
  databases.forEach((database) => {
    backupDatabase(database);
  });
});

bot.use(async(ctx, next) => {
  if(!config.telegram.whitelisted_user_id.includes(ctx.from.id.toString())) return ctx.reply(`👀`);
  next();
});

bot.start((ctx) => ctx.reply('Hello World'));

bot.command('get', async(ctx) => {
  let args = ctx.update.message.text.split(" ");
  args.shift();

  if(args.length < 2) return ctx.reply('needed args: DD/MM/YY databasename');

  let messageId = await db.get(`${args[0]}.${args[1]}`);
  if(!messageId) return ctx.reply('Can\'t get message id from database!');

  ctx.telegram.forwardMessage(ctx.from.id, config.telegram.chat_id, messageId);
})

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));