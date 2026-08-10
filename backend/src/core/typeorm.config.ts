import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',

  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),

  username: process.env.DB_USERNAME || 'criss',
  password: process.env.DB_PASSWORD || 'crissx',
  database: process.env.DB_NAME || 'recargas_gaming',

  entities: [__dirname + '/../**/*.entity{.ts,.js}'],

  migrations: [__dirname + '/../migrations/*{.ts,.js}'],

  autoLoadEntities: true,

  synchronize: false,
  dropSchema: false,

  logging: true,
};

export const AppDataSource = new DataSource({
  type: 'postgres',

  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),

  username: process.env.DB_USERNAME || 'criss',
  password: process.env.DB_PASSWORD || 'crissx',
  database: process.env.DB_NAME || 'recargas_gaming',

  entities: [__dirname + '/../**/*.entity{.ts,.js}'],

  migrations: [__dirname + '/../migrations/*{.ts,.js}'],

  synchronize: false,
  logging: true,
});