import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : 'postgres',
  database: process.env.DB_NAME || 'recharges_gaming_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: true,
  dropSchema: false,
  logging: true,
  logger: 'file',
  extra: {
    password: process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : 'postgres',
  },
};
