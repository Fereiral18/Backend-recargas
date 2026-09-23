import { config as loadEnv } from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

// This file is evaluated at import time — before Nest's ConfigModule loads
// .env — and also standalone by the TypeORM migration CLI, so it loads .env
// itself. Without this, process.env.DB_* was always undefined here.
// quiet: dotenv 17 otherwise logs a tip line on every load.
loadEnv({ quiet: true });

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not defined in environment variables`);
  }

  return value;
}

// Queries (with their parameters, e.g. password hashes) are only logged when
// explicitly asked for, never by default.
const logging = process.env.DB_LOGGING === 'true';

const baseOptions: DataSourceOptions = {
  type: 'postgres',

  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),

  // No hardcoded fallback credentials: they must come from the environment.
  username: requireEnv('DB_USERNAME'),
  password: requireEnv('DB_PASSWORD'),
  database: requireEnv('DB_NAME'),

  entities: [__dirname + '/../**/*.entity{.ts,.js}'],

  migrations: [__dirname + '/../migrations/*{.ts,.js}'],

  synchronize: false,

  logging,
};

export const typeOrmConfig: TypeOrmModuleOptions = {
  ...baseOptions,
  autoLoadEntities: true,
  dropSchema: false,
};

export const AppDataSource = new DataSource(baseOptions);
