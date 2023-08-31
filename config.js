require("dotenv").config();

module.exports.config = {
  cron: "0 0 * * *",
  telegram: {
    bot_token: process.env.TG_BOT_TOKEN,
    chat_id: process.env.TG_CHAT_ID, // where the backup file will be sent.
    whitelisted_user_id: [], // only they can execute bot commands
  },

  dayjs: {
    locale: require("dayjs/locale/id"),
    timezone: "Asia/Jakarta",
    format: "DD MMM YYYY [pada] HH.mm",
  },

  logs: true,
};

module.exports.databases = [
  {
    name: process.env.DB_NAME_TEACHERMATE,
    host: process.env.DB_HOST_TEACHERMATE,
    port: process.env.DB_PORT_TEACHERMATE,
    user: process.env.DB_USER_TEACHERMATE,
    password: process.env.DB_USER_PASSWORD_TEACHERMATE,
  },

  {
    name: process.env.DB_NAME_SARPRAS,
    host: process.env.DB_HOST_SARPRAS,
    port: process.env.DB_PORT_SARPRAS,
    user: process.env.DB_USER_SARPRAS,
    password: process.env.DB_USER_PASSWORD_SARPRAS,
  },
];
