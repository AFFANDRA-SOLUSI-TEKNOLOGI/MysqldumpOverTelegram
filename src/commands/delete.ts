import { Markup, Context } from "telegraf";
import { db } from "../server";

module.exports = {
  name: "delete",
  async execute(ctx: Context) {
      let get = await db.get("databases");

      if (!get || !get.length) return ctx.reply("You dont have any website to delete!");
      let button: any = [];
    
      get.map((x: any) => button.push(Markup.button.callback(x.name, `delete ${x.name}`)));
    
      ctx.reply("Choose database that you want to delete:", {
        ...Markup.inlineKeyboard(button),
      });
  }
}