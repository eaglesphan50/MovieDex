import { AppDataSource } from '../data-source';
import { NextFunction, Request, Response } from 'express';
import { User } from '../entity/User';
import * as moment from 'moment';
import { Movie } from '../entity/Movie';
import { Badge } from '../entity/Badge';
import { logger } from '../../lib/logger';

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
      logger.info('no user found for id: ' + id);
      return 'unregistered user';
    }

    logger.info('got user: ' + JSON.stringify(user));
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

    logger.info('saved user: ' + JSON.stringify(user));

    return this.userRepository.save(user);
  }

  async remove(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);

    const userToRemove = await this.userRepository.findOneBy({ id });

    if (!userToRemove) {
      return `no user with id: ${id} present`;
    }

    logger.info('removing user: ' + JSON.stringify(userToRemove));
    await this.userRepository.remove(userToRemove);

    return `user with id: ${id} removed`;
  }

  async watchMovie(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);
    const movieId = parseInt(request.body.movieId);

    let user = await this.userRepository.findOne({
      relations: ['movies', 'badges'],
      where: { id }
    });
    if (!user) {
      logger.info(`user with id: ${id} does not exist`);
      return `user with id: ${id} does not exist`;
    }

    const movie = await AppDataSource.getRepository(Movie).findOne({ 
      where: {id: movieId},
      relations: ['badges']
    });
    if (!movie) {
      logger.info(`movie with id: ${movieId} does not exist`);
      return `movie with id: ${movieId} does not exist`;
    }

    // Add movie to the user's watchlist
    const updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const moviesSeen = user.movies;
    if (moviesSeen.some(m => m.id === movie.id)) {
      logger.info(`user: ${id} has already seen movie: ${movieId}`);
      return `user: ${id} has already seen movie: ${movieId}`;
    }

    moviesSeen.push(movie);
    user = Object.assign(user, {
      movies: moviesSeen,
      updated_at: updatedAt
    });
    user = await this.userRepository.save(user);
    logger.info(`added movie: ${movie.id} to user: ${id} watchlist`);

    // see if badge should be awarded
    let anyBadgesGiven = false;
    const newBadges: Badge[] = [];
    for (const badge of movie.badges) {
      if (user.badges.some(b => b.id === badge.id)) {
        continue; // user already has badge
      }
      const fullBadge = await AppDataSource.getRepository(Badge).findOne({ 
        where: {id: badge.id},
        relations: ['movies']
      });
      let giveBadge = true;
      for (const movieInLoop of fullBadge.movies) {
        if (!user.movies.some(m => m.id === movieInLoop.id)) {
          giveBadge = false;
          break; // user has not seen all of the movies for this badge
        }
      }

      // user has seen the all of the movies for this badge and it can be given
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

    const stringifiedBadgeIds = JSON.stringify(newBadges.map(badge => badge.id));
    logger.info(`user: ${id} has acquired badges: ${stringifiedBadgeIds}`);

    // return badge information (if any) to display on the front end
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

    logger.info('getting all movies seen by user: ' + id);

    return user.movies;
  }

  async heldBadges(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);

    const user = await this.userRepository.findOne({
      relations: ['badges'],
      where: { id }
    });

    logger.info('getting all badges seen by user: ' + id);

    return user.badges;
  }
}