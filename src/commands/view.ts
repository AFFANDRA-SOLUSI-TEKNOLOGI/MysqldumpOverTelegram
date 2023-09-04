import { Context } from "telegraf";
import { db } from "../server";

module.exports = {
  name: "view",
  async execute(ctx: Context, args: string[]) {   
      if (!args.length) return ctx.reply("argument needed!");
      let get = await db.get("databases");
      let database = get.find((x: any) => x.name === args[0]);
      if (!database) return ctx.reply("Database doesn't exists!");
    
      ctx.reply(`Name: ${database.name}\nHost: ${database.host}:${database.port}\nUser: ${database.user}\nPassword: ${database.password}`);
  }
}