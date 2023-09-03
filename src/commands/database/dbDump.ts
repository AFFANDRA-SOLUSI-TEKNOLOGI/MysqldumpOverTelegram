import { db } from "../../server";
import { Markup } from "telegraf";

const dbDumpCommand = async (ctx: any) => {
  let get = await db.get("databases");

  if (!get || !get.length) return ctx.reply("You dont have any website to dump!");
  let button: any = [];

  get.map((x: any) => button.push(Markup.button.callback(x.name, `backup ${x.name}`)));

  ctx.reply("Choose database that you want to dump:", {
    ...Markup.inlineKeyboard(button),
  });
};

export default dbDumpCommand;
