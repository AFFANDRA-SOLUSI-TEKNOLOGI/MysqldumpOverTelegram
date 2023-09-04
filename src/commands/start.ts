import { Context, Markup } from "telegraf";
import { CommandHandler } from "../server";

module.exports = {
    name: "start",
    aliases: ["help", "menu"],
    async execute(ctx: Context) {
        let all = Array.from(CommandHandler.commands.values());
        let commands: string[] = [];

        all.map((x: { name: string, execute: Promise<any> }) => commands.push(x.name));
        ctx.reply(`<b>Welcome @${ctx.from?.username}!</b>\n\n<i>🤖 Command List:\n/${commands.join(", /")}</i>`, {
            parse_mode: 'HTML', ...Markup.inlineKeyboard([
                Markup.button.url('🐈 Source Code on Github', 'https://github.com/AFFANDRA-SOLUSI-TEKNOLOGI/MysqldumpOverTelegram')
            ])
        });
    }
}