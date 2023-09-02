import dotenv from "dotenv";
dotenv.config();

const config: Config = {
  cron: "0 0 * * *",
  telegram: {
    bot_token: process.env.TG_BOT_TOKEN || "",
    chat_id: process.env.TG_CHAT_ID || "",
    whitelisted_user_id: [],
  },

  dayjs: {
    locale: require("dayjs/locale/id"),
    timezone: "Asia/Jakarta",
    format: "DD MMM YYYY [pada] HH.mm",
  },

  logs: false,
};

const databases: DatabaseConfig[] = [
  {
    name: process.env.DB_NAME_TEACHERMATE || "",
    host: process.env.DB_HOST_TEACHERMATE || "",
    port: Number(process.env.DB_PORT_TEACHERMATE) || 0,
    user: process.env.DB_USER_TEACHERMATE || "",
    password: process.env.DB_USER_PASSWORD_TEACHERMATE || "",
  },

  {
    name: process.env.DB_NAME_SARPRAS || "",
    host: process.env.DB_HOST_SARPRAS || "",
    port: Number(process.env.DB_PORT_SARPRAS) || 0,
    user: process.env.DB_USER_SARPRAS || "",
    password: process.env.DB_USER_PASSWORD_SARPRAS || "",
  },
];

export { config, databases };
