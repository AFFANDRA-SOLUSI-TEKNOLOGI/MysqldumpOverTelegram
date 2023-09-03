import { db } from "../../server";

const dbEditCommand = async (ctx: any) => {
  let args = ctx.update.message.text.split(" ");
  args.shift();

  let [name, type, new_value] = args;
  const types = "name, host, port, user, password";

  if (!name || !type || !new_value || !types.split(", ").includes(type)) return ctx.reply(`usage: /edit db_name type new_value\n\n- Available types: ${types}.`);

  let get = await db.get("databases");
  let database = get.find((x: any) => x.name === name);
  if (!database) return ctx.reply("Database doesn't exists!");

  let edited: any = {
    name: database.name,
    host: database.host,
    port: database.port,
    user: database.username,
    password: database.password,
  };

  if (new_value === "%empty%") new_value = "";
  edited[type] = new_value;

  await db.pull("databases", (x: any) => x.name === database.name);
  await db.push("databases", edited);
  ctx.reply("Successfully edited!");
};

export default dbEditCommand;
