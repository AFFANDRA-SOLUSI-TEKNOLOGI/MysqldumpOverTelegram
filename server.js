require("dotenv").config();

const path = require("path");
const fs = require("fs");

const mysql = require("mysql");
const mysqldump = require('mysqldump');
const cron = require("node-cron");
const { exec } = require("child_process");
const { config, databases } = require("./config.js");

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.locale(config.dayjs.locale);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(config.dayjs.timezone);

const backupDatabase = (database) => {
  const connectionConfig = {
    host: database.host || "localhost",
    user: database.user,
    password: database.password,
    database: database.name,
    port: database.port || 3306
  }

  const formattedDate = dayjs().format(config.dayjs.format);
  const backupFilename = `${database.name} ${formattedDate}.sql`;
  const backupPath = path.join(__dirname, "database", database.name);

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
            dumpToFile: `${backupPath}/${backupFilename}`,
          });
  
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

cron.schedule("* * * * *", () => {
  console.log("Starting cron job...");
  databases.forEach((database) => {
    backupDatabase(database);
  });
});