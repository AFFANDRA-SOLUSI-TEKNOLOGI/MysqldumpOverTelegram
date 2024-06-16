export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      TG_BOT_TOKEN: string;
      TG_CHAT_ID: string;
      TG_WHITELISTED_USER_ID: String;
    }
  }

  interface TelegramConfig {
    bot_token: string;
    chat_id: string;
    whitelisted_user_id: string[];
  }

  interface DayjsConfig {
    locale: any;
    format: string;
  }

  interface DatabaseConfig {
    name: string;
    host: string;
    port: string | number;
    user: string;
    password: string;
  }

  interface Config {
    cron: string;
    timezone: string;
    telegram: TelegramConfig;
    dayjs: DayjsConfig;
    logs: boolean;
  }

  interface CommandMapOptions {
    name: string;
    aliases?: string[];
    description?: string;
    execute: Promise<any>;
  }
}
