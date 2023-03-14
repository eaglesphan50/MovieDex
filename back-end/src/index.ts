/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-console */
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Request, Response } from 'express';
import { AppDataSource } from './data-source';
import { Routes } from './routes';
import { User } from './entity/User';
import { Movie } from './entity/Movie';
import { Badge } from './entity/Badge';

AppDataSource.initialize().then(async () => {

  // create express app
  const app = express();
  app.use(bodyParser.json());

  // register express routes from defined application routes
  Routes.forEach(route => {
    (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
      const result = (new (route.controller as any))[route.action](req, res, next);
      if (result instanceof Promise) {
        result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);
      } else if (result !== null && result !== undefined) {
        res.json(result);
      }
    });
  });

  // setup express app here
  // ...


  // start express server
  app.listen(3000);

  // // insert new users for test
  // const firstUser = AppDataSource.manager.create(User, {
  //   username: 'Saturrn',
  //   email: 'me@example.com',
  //   password: 'ooo'
  // });
  // const secondUser = AppDataSource.manager.create(User, {
  //   username: 'Saturrn7',
  //   email: 'me2@example.com',
  //   password: 'ooo'
  // });

  // await AppDataSource.manager.save(firstUser);
  // await AppDataSource.manager.save(secondUser);

  // const movie1 = AppDataSource.manager.create(Movie, {
  //   users: [firstUser, secondUser]
  // });
  // const movie2 = AppDataSource.manager.create(Movie, {
  //   users: [firstUser, secondUser]
  // });
  // const movie3 = AppDataSource.manager.create(Movie, {
  //   users: [firstUser]
  // });

  // // insert new movies for test
  // await AppDataSource.manager.save(movie1);
  // await AppDataSource.manager.save(movie2);
  // await AppDataSource.manager.save(movie3);

  // const testBadge = AppDataSource.manager.create(Badge, {
  //   name: 'Test Badge',
  //   icon: 'test.png',
  //   rarity: 3,
  //   description: 'test badge',
  //   movies: [movie1, movie3]
  // });

  // await AppDataSource.manager.save(testBadge);

  console.log('Express server has started on port 3000. Open http://localhost:3000/users to see results');

}).catch(error => console.log(error));
