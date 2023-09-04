import dotenv from "dotenv";
dotenv.config();

const config: Config = {
  cron: "59 23 * * *",
  timezone: "Asia/Jakarta",
  telegram: {
    bot_token: process.env.TG_BOT_TOKEN || "",
    chat_id: process.env.TG_CHAT_ID || "",
    whitelisted_user_id: process.env.TG_WHITELISTED_USER_ID?.split(", ") as string[],
  },
  dayjs: {
    locale: require("dayjs/locale/id"),
    format: "DD MMM YYYY [pada] HH.mm",
  },

  logs: true,
};

export { config };
