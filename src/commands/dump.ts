import { Context, Markup } from "telegraf";
import { db } from "../server";

module.exports = {
  name: "dump",
  description: "Dump/Backup selected database.",
  async execute(ctx: Context) {
      let get = await db.get("databases");

      if (!get || !get.length) return ctx.reply("You dont have any database to dump!");
      let button: any = [];
    
      get.map((x: any) => button.push(Markup.button.callback(x.name, `backup ${x.name}`)));
    
      ctx.reply("Choose database that you want to dump:", {
        ...Markup.inlineKeyboard(button, { columns: 2 }),
      });
  }
}