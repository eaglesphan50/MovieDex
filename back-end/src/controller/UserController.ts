import { AppDataSource } from '../data-source';
import { NextFunction, Request, Response } from 'express';
import { User } from '../entity/User';
import * as moment from 'moment';

export class UserController {

  private userRepository = AppDataSource.getRepository(User);

  async all(request: Request, response: Response, next: NextFunction) {
    return this.userRepository.find();
  }

  async one(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);

    const user = await this.userRepository.findOne({
      where: { id }
    });

    if (!user) {
      return 'unregistered user';
    }
    return user;
  }

  async save(request: Request, response: Response, next: NextFunction) {
    const { email, password, username } = request.body;

    const updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');

    const user = Object.assign(new User(), {
      email,
      password,
      username,
      updated_at: updatedAt
    });

    return this.userRepository.save(user);
  }

  async remove(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);

    const userToRemove = await this.userRepository.findOneBy({ id });

    if (!userToRemove) {
      return 'this user not exist';
    }

    await this.userRepository.remove(userToRemove);

    return 'user has been removed';
  }

}