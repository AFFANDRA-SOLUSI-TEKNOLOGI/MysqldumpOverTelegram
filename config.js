require("dotenv").config();

module.exports.databases = [
  // store all your databases credentials in the config
  //! tips: use .env libs for security measurements

  // {
  //     name: 'your db name',
  //     host: 'your db host',
  //     user: 'your db user',
  //     password: 'your db user password',
  // }

  {
    name: process.env.DB_NAME_TEACHERMATE,
    host: process.env.DB_HOST_TEACHERMATE,
    user: process.env.DB_USER_TEACHERMATE,
    password: process.env.DB_USER_PASSWORD_TEACHERMATE,
  },

  {
    name: process.env.DB_NAME_SARPRAS,
    host: process.env.DB_HOST_SARPRAS,
    user: process.env.DB_USER_SARPRAS,
    password: process.env.DB_USER_PASSWORD_SARPRAS,
  },
];
