import fs from "fs";
import { bot } from "../server";
import { config } from "../config";
import { db } from "../server";
import dayjs from "dayjs";
import { ConnectionConfig } from "mysql";

const sendToTelegram = async (filePath: string, backupFilename: string, connectionConfig: ConnectionConfig): Promise<void> => {
  try {
    const dateNow = dayjs().tz(config.timezone);
    let result = await bot.telegram.sendDocument(config.telegram.chat_id, {
      source: fs.createReadStream(filePath),
      filename: backupFilename,
    });

    console.log(result);

    await db.push(`${dateNow.format("DD/MM/YY")}.${connectionConfig.database}`, result.message_id);
  } catch (error) {
    console.error(`SEND TO TELEGRAM ERR `, error);
  }
};

export default sendToTelegram;
