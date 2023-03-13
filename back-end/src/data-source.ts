import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/User';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'moviedex.caswopqazm6e.us-east-1.rds.amazonaws.com',
  port: 3306,
  username: 'admin',
  password: '',
  database: 'MovieDex',
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});
