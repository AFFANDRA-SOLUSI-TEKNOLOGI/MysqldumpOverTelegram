export {};

declare global {
  interface IDatabase {
    name: string;
    host: string;
    port: number;
    user: string;
    password: string;
  }
}
