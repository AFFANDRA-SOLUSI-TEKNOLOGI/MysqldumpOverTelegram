import { config } from "../config";
import fs from "fs";
import path from "path";

const logsCommand = (ctx: any) => {
  if (!config.logs) return ctx.reply("Logs system are disabled.");
  let args = ctx.update.message?.text?.split(" ");
  args.shift();

  if (!args.length) return ctx.reply("logs name is required!");

  try {
    const logContent = fs.readFileSync(path.join(__dirname, "../", "../logs", args[0], `logs-${args[0]}.log`), { encoding: "utf-8" });
    return ctx.reply(logContent);
  } catch (error) {
    return ctx.reply(`No such ${args[0]} log file were found in directory ${path.join(__dirname, "../", "../logs", args[0], `logs-${args[0]}.log`)}`);
  }
};

export default logsCommand;
