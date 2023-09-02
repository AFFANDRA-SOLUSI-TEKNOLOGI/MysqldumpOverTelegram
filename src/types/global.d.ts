export {};

declare global {
  interface TelegramConfig {
    bot_token: string;
    chat_id: string;
    whitelisted_user_id: string[];
  }

  interface DayjsConfig {
      locale: any;
      timezone: string;
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
      telegram: TelegramConfig;
      dayjs: DayjsConfig;
      logs: boolean;
  }
}
