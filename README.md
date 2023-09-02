# mysqldump over Telegram

A simple code that will backup your MySQL database on a schedule with `mysqloverdump` and send the files to Telegram as a file hosting. *Pssttt... You can also back up multiple databases at once.*

## Self Hosted

```sh
# clone this repository
git clone https://github.com/AFFANDRA-SOLUSI-TEKNOLOGI/MysqldumpOverTelegram
cd MysqldumpOverTelegram

# install needed dependencies
pnpm i

# copy .env.example to .env
cp .env.example .env

# now you can configure what database connection you want to 
# backup and other things you need in config.js & .env

# build the project
pnpm build

# start the project
pnpm start
```

