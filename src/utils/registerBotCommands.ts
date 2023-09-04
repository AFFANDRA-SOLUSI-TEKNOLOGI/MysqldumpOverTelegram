import { BotCommand } from "telegraf/typings/core/types/typegram";
import { CommandHandler, bot } from "../server"

const registerBotCommands = async() => {
    const all = Array.from(CommandHandler.commands.values());
    const commands: BotCommand[] = [];

    all.map((x: CommandMapOptions) => commands.push({ command: x.name, description: x.description as string }));
    bot.telegram.setMyCommands(commands);
}

export { registerBotCommands };