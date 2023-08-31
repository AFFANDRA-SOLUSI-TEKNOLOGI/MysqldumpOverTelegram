require("dotenv").config();
const fs = require("fs");
const mysql = require("mysql");
const cron = require("node-cron");
const { exec } = require("child_process");

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const backupDatabase = () => {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().replace(/:/g, "-");
  const backupFilename = `backup-guruku-${formattedDate}.sql`;

  const backupCommand = `mysqldump -u ${process.env.DB_USER} -p="${process.env.DB_PASSWORD}" --databases ${process.env.DB_NAME} > ${backupFilename}`;

  //   connection.connect();

  connection.query("SHOW DATABASES", (error, results) => {
    if (error) throw error;

    const databaseNames = results.map((result) => result.Database);
    if (databaseNames.includes(process.env.DB_NAME)) {
      // Perform backup command
      exec(backupCommand, (error, stdout, stderr) => {
        if (error) throw error;
        console.log("Backup completed:", backupFilename);
      });
    }
  });

  //   connection.end();
};

// Schedule backup to run every day at 2 AM
cron.schedule("* * * * *", backupDatabase);
