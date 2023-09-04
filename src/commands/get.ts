import { config } from "../config";
import { Context } from "telegraf";
import { db } from "../server";

module.exports = {
  name: "get",
  description: "Get dump file by date and database name.",
  async execute(ctx: Context, args: string[]) {
      if (args.length < 2) return ctx.reply("needed args: DD/MM/YY databasename");

      let messageId = await db.get(`${args[0]}.${args[1]}`);
      if (!messageId) return ctx.reply("Can't get message id from database!");
    
      messageId.forEach((id: number) => {
        try {
          ctx.telegram.forwardMessage(ctx.from?.id as number, config.telegram.chat_id, id);
        } catch (err) {
          console.log("[GET]", err);
          ctx.reply("Somehting error here...");
        }
      });
  }
}