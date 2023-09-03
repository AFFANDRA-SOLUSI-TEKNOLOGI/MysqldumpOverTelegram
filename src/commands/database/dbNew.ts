import { QuickDB, JSONDriver } from "quick.db";
import { db } from "../../server";

const dbNewCommand = async (ctx: any) => {
  let args = ctx.update.message.text.split(" ");
  args.shift();

  const [name, host, port, user, password] = args;

  if (!name || !host || !port || !user || !password) return ctx.reply("usage: /new db_name db_host db_port db_username db_password\n\n* empty password? just use %empty%");

  const get = await db.get("databases");
  if (get && get.find((x: any) => x.name === name)) return ctx.reply("Databases already exists!");

  await db.push("databases", { name, host, port, user, password: password === "%empty%" ? "" : password });
  ctx.reply("Successfully added!");
};

export default dbNewCommand;
