import { Context } from "telegraf";
import { db } from "../server";

module.exports = {
  name: "list",
  description: "Show all database.",
  async execute(ctx: Context) {
      let get = await db.get("databases");
      let arr: any = [];
    
      if (!get || !get.length) return ctx.reply("empty.");
    
      get.map((x: any) => arr.push(x.name));
      ctx.reply(arr.join(", "));
  }
}