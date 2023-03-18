import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

import { User } from './entity/User';
import { Badge } from './entity/Badge';
import { Movie } from './entity/Movie';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.SQL_HOST,
  port: parseInt(process.env.SQL_PORT),
  username: process.env.SQL_USER,
  password: process.env.SQL_PASS,
  database: process.env.SQL_DB,
  synchronize: true,
  logging: false,
  entities: [User, Badge, Movie],
  migrations: [],
  subscribers: [],
});
