import { LOCAL_DB_URL } from './db-path';

export interface DbClientConfig {
  url: string;
  authToken?: string;
}

export const resolveDbClientConfig = (): DbClientConfig => ({
  url: process.env.TURSO_DATABASE_URL || LOCAL_DB_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
