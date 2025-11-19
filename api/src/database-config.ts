export interface DatabaseConfig {
  readonly host: string;
  readonly database: string;
  readonly user: string;
  readonly port: number;
  readonly password: string;
  readonly ssl: boolean;
}
