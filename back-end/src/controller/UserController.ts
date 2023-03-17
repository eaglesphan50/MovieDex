/* eslint-disable no-console */
import { AppDataSource } from '../data-source';
import { NextFunction, Request, Response } from 'express';
import { User } from '../entity/User';
import * as moment from 'moment';
import { Movie } from '../entity/Movie';
import { Badge } from '../entity/Badge';

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

  async watchMovie(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);
    const movieId = parseInt(request.body.movieId);

    let user = await this.userRepository.findOne({
      relations: ['movies', 'badges'],
      where: { id }
    });
    const movie = await AppDataSource.getRepository(Movie).findOne({ 
      where: {id: movieId},
      relations: ['badges']
    });

    const updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');

    const moviesSeen = user.movies;
    if (!moviesSeen.includes(movie)) {
      moviesSeen.push(movie);
    }

    user = Object.assign(user, {
      movies: moviesSeen,
      updated_at: updatedAt
    });

    user = await this.userRepository.save(user);

    // check if badge added
    let anyBadgesGiven = false;
    const newBadges = [];
    for (const badge of movie.badges) {
      if (user.badges.some((b: Badge) => b.id === badge.id)) {
        continue;
      }
      const fullBadge = await AppDataSource.getRepository(Badge).findOne({ 
        where: {id: badge.id},
        relations: ['movies']
      });
      let giveBadge = true;
      for (const movieInLoop of fullBadge.movies) {
        if (!user.movies.some((m: Movie) => m.id === movieInLoop.id)) {
          giveBadge = false;
        }
      }
      if (giveBadge) {
        const heldBadges = user.badges;
        heldBadges.push(badge);
        newBadges.push(badge);
        user = Object.assign(user, {
          badges: heldBadges
        });
        user = await this.userRepository.save(user);
      }
      anyBadgesGiven = giveBadge;
    }

    return {
      userId: id,
      movieId,
      badgesAquired: anyBadgesGiven,
      badges: newBadges
    };
  }

  async seenMovies(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);

    const user = await this.userRepository.findOne({
      relations: ['movies'],
      where: { id }
    });

    console.log(user);

    return user.movies;
  }

  async heldBadges(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);

    const user = await this.userRepository.findOne({
      relations: ['badges'],
      where: { id }
    });

    return user.badges;
  }
}