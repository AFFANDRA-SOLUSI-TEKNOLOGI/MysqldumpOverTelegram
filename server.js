require("dotenv").config();
const mysql = require("mysql");
const cron = require("node-cron");
const { exec } = require("child_process");
const { databases } = require("./config.js");
const path = require("path");
const fs = require("fs");

const backupDatabase = (database) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().replace(/:/g, "-");
  const backupFilename = `backup-${database.name}-${formattedDate}.sql`;
  const backupPath = path.join(__dirname, "database", database.name);

  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }

  const connection = mysql.createConnection({
    host: database.host || "localhost",
    user: database.user,
    password: database.password,
    database: database.name,
  });

  connection.connect((error) => {
    if (error) {
      console.error(`Error connecting to ${database.name}: ${error}`);
      return;
    }

    connection.query("SHOW DATABASES", (error, results) => {
      if (error) {
        console.error(`Error querying databases for ${database.name}: ${error}`);
        connection.destroy();
        return;
      }

      const databaseNames = results.map((result) => result.Database);
      if (databaseNames.includes(database.name)) {
        const backupCommand = `mysqldump -u ${database.user} -p="${database.password}" --databases ${database.name} > ${backupPath}/${backupFilename}`;

        // Perform backup command
        exec(backupCommand, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error performing backup for ${database.name}: ${error}`);
          } else {
            console.log(`Backup completed for ${database.name}:`, backupFilename);
          }

          connection.end();
        });
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
