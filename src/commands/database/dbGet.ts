import { config } from "../../config";
import { db } from "../../server";

const dbGetCommand = async (ctx: any) => {
  let args = ctx.update.message.text.split(" ");
  args.shift();

  if (args.length < 2) return ctx.reply("needed args: DD/MM/YY databasename");

  let messageId = await db.get(`${args[0]}.${args[1]}`);
  if (!messageId) return ctx.reply("Can't get message id from database!");

  messageId.forEach((id: number) => {
    try {
      ctx.telegram.forwardMessage(ctx.from.id, config.telegram.chat_id, id);
    } catch (err) {
      console.log("[GET]", err);
      ctx.reply("Somehting error here...");
    }
  });
};

export default dbGetCommand;
