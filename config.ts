import { config as dotenvconfig } from "dotenv";
dotenvconfig();

interface IConfig {
  cron: string;
  telegram: {
    bot_token: string;
    chat_id: string;
    whitelisted_user_id: string[];
  };

  dayjs: {
    locale: string;
    timezone: string;
    format: string;
  };

  logs: boolean;
}

const config: IConfig = {
  cron: "0 0 * * *",
  telegram: {
    bot_token: process.env.TG_BOT_TOKEN || "",
    chat_id: process.env.TG_CHAT_ID || "",
    whitelisted_user_id: [process.env.TG_USER_OCHA || ""],
  },

  dayjs: {
    locale: require("dayjs/locale/id"),
    timezone: "Asia/Jakarta",
    format: "DD MMM YYYY [pada] HH.mm",
  },

  logs: false,
};

const databases: IDatabase[] = [
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

export { IConfig, config, databases };
