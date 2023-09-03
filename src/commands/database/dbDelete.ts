import { db } from "../../server";
import { Markup } from "telegraf";

const dbDeleteCommand = async (ctx: any) => {
  let get = await db.get("databases");

  if (!get || !get.length) return ctx.reply("You dont have any website to delete!");
  let button: any = [];

  get.map((x: any) => button.push(Markup.button.callback(x.name, `delete ${x.name}`)));

  ctx.reply("Choose database that you want to delete:", {
    ...Markup.inlineKeyboard(button),
  });
};

export default dbDeleteCommand;
