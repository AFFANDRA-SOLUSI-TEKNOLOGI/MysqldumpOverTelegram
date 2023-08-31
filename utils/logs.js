const fs = require("fs");
const path = require("path");

const createLog = (database) => {
  try {
    const timestamp = new Date().toISOString();
    const logsPath = path.join(__dirname, "../logs", database.name.split(" ")[0]);

    if (!fs.existsSync(logsPath)) {
      fs.mkdirSync(logsPath, { recursive: true });
      fs.writeFileSync(`${logsPath}/logs-${database.name.split(" ")[0]}.log`, `Created Logs File at ${timestamp}\n\n`);
    }

    fs.appendFileSync(`${logsPath}/logs-${database.name.split(" ")[0]}.log`, `[${timestamp}] Successfully Backing up ${database.name}\n`);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { createLog };
