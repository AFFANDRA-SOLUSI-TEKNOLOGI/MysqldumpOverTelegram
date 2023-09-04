import { Context } from "telegraf";

module.exports = {
    name: "start",
    async execute(ctx: Context) {
        ctx.reply("Hello World!");
    }
}