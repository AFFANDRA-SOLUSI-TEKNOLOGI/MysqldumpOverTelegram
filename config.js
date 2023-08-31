require("dotenv").config();

module.exports.config = {
  "telegram": {
    "bot_token": process.env.TG_BOT_TOKEN,
    "chat_id": process.env.TG_CHAT_ID,
    "whitelisted_user_id": []
  },
  "dayjs": {
    "locale": require('dayjs/locale/id'),
    "timezone": 'Asia/Jakarta',
    "format": 'DD MMM YYYY [pada] HH.mm'
  }
}

module.exports.databases = [
  {
    name: process.env.DB_NAME_TEACHERMATE,
    host: process.env.DB_HOST_TEACHERMATE,
    port: process.env.DB_PORT_TEACHERMATE,
    user: process.env.DB_USER_TEACHERMATE,
    password: process.env.DB_USER_PASSWORD_TEACHERMATE,
  },
];
