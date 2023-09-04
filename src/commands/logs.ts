import { config } from "../config";
import { Context } from "telegraf";
import fs from "fs";
import path from "path";

module.exports = {
  name: "logs",
  async execute(ctx: Context, args: string[]) {
    if (!config.logs) return ctx.reply("Logs system are disabled.");

    if (!args.length) return ctx.reply("logs name is required!");

    let logPath = path.resolve() + `/logs/${args[0]}/logs-${args[0]}.log`;
    try {
      const logContent = fs.readFileSync(logPath, { encoding: "utf-8" });
      return ctx.reply(logContent);
    } catch (error) {
      return ctx.reply(`No such ${args[0]} log file were found in directory ${logPath}`);
    }
  }
}