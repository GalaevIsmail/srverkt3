import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'node:path';
import { Seller } from '../seller/entities/seller.entity';
import { Product } from '../product/entities/product.entity';
import { validateEnvironment } from './config';

const env = validateEnvironment(process.env);
export default new DataSource({
  type: 'postgres',
  host: env.DB_HOST as string,
  port: env.DB_PORT as number,
  username: env.DB_USERNAME as string,
  password: env.DB_PASSWORD as string,
  database: env.DB_DATABASE as string,
  entities: [Seller, Product],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  synchronize: false,
});
