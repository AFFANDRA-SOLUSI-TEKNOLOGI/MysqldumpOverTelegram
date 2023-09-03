import { db } from "../../server";

const dbListCommand = async (ctx: any) => {
  let get = await db.get("databases");
  let arr: any = [];

  if (!get || !get.length) return ctx.reply("empty.");

  get.map((x: any) => arr.push(x.name));
  ctx.reply(arr.join(", "));
};

export default dbListCommand;
