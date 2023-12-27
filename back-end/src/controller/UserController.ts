import * as moment from 'moment';
import * as httpError from 'http-errors';
import { createHash } from 'crypto';

import { AppDataSource } from '../data-source';
import { NextFunction, Request, Response } from 'express';
import { User } from '../entity/User';
import { Movie } from '../entity/Movie';
import { Badge } from '../entity/Badge';
import { logger } from '../../lib/logger';
import { Rating } from '../entity/Rating';

interface WatchMovieReturn {
  userId: number,
  movieId: number,
  ratingId: number,
  badgesAquired: boolean,
  badges: Badge[]
}

export class UserController {

  private userRepository = AppDataSource.getRepository(User);
  private badgeRepository = AppDataSource.getRepository(Badge);
  private ratingRepository = AppDataSource.getRepository(Rating);
  private movieRepository = AppDataSource.getRepository(Movie);

  async all(request: Request, response: Response, next: NextFunction) {
    return this.userRepository.find();
  }

  async one(request: Request, response?: Response, next?: NextFunction): Promise<User> {
    const id = parseInt(request.params.id);
    if (!id) {
      logger.info('missing param id');
      throw new httpError.BadRequest('missing param id');
    }

    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      logger.info(`user: ${id} not found`);
      throw new httpError.NotFound(`user: ${id} not found`);
    }

    logger.info(`found user id: ${id}`);
    return user;
  }

  async create(request: Request, response?: Response, next?: NextFunction): Promise<User> {
    const { email, password, username } = request.body;

    const updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');

    const hashedPassword = createHash('sha256').update(password).digest('hex');

    let user = Object.assign(new User(), {
      email,
      password: hashedPassword,
      username,
      updated_at: updatedAt
    });

    logger.info('created user: ' + JSON.stringify(user));

    try {
      user = await this.userRepository.save(user);
    } catch (e) {
      logger.info('error creating user');
      throw new httpError.InternalServerError('error creating user');
    }

    return user;
  }

  async update(request: Request, response: Response, next: NextFunction): Promise<User> {
    const id = parseInt(request.params.id);
    const { email, password, username } = request.body;
    if (!id) {
      logger.info('missing param id');
      throw new httpError.BadRequest('missing param id');
    }

    let user = await this.userRepository.findOneBy({ id });
    if (!user) {
      logger.info(`user: ${id} not found`);
      throw new httpError.NotFound(`user: ${id} not found`);
    }

    user = Object.assign(user, {
      email,
      password,
      username,
      updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
    });

    try {
      user = await this.userRepository.save(user);
    } catch (e) {
      logger.info(`error saving user: ${id}`);
      throw new httpError.InternalServerError(`error saving user: ${id}`);
    }

    logger.info(`updated user: ${id}`);
    return user;
  }

  async remove(request: Request, response?: Response, next?: NextFunction): Promise<void> {
    const id = parseInt(request.params.id);
    if (!id) {
      logger.info('missing param id');
      throw new httpError.BadRequest('missing param id');
    }

    const userToRemove = await this.userRepository.findOneBy({ id });
    if (!userToRemove) {
      logger.info(`user: ${id} not found`);
      throw new httpError.NotFound(`user: ${id} not found`);
    }

    try {
      await this.userRepository.remove(userToRemove);
    } catch (e) {
      logger.info(`error removing user: ${id}`);
      throw new httpError.InternalServerError(`error removing user: ${id}`);
    }

    logger.info(`removed user: ${id}`);
    return;
  }

  async watchMovie(request: Request, response?: Response, next?: NextFunction): Promise<WatchMovieReturn> {
    const userId = parseInt(request.params.userId);
    if (!userId) {
      logger.info('missing param userId');
      throw new httpError.BadRequest('missing param userId');
    }

    const movieId = parseInt(request.body.movieId);
    if (!movieId) {
      logger.info('missing param movieId');
      throw new httpError.BadRequest('missing param movieId');
    }

    let user = await this.userRepository.findOne({
      relations: ['ratings', 'badges'],
      where: { id: userId }
    });
    if (!user) {
      logger.info(`user: ${userId} not found`);
      throw new httpError.NotFound(`user: ${userId} not found`);
    }

    const movie = await AppDataSource.getRepository(Movie).findOne({ 
      where: {id: movieId},
      relations: ['badges', 'ratings']
    });
    if (!movie) {
      logger.info(`movie: ${movieId} not found`);
      throw new httpError.NotFound(`movie: ${movieId} not found`);
    }

    // Has user already seen the movie
    const updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const moviesRatedByUser = user.ratings;
    const existingRating = moviesRatedByUser.find(r => r.movie.id === movie.id);
    if (existingRating) {
      logger.info(`user: ${userId} has already seen movie: ${movieId}`);
      return {
        userId,
        movieId,
        ratingId: existingRating.id,
        badgesAquired: false,
        badges: []
      };
    }

    // save rating
    const rating = Object.assign(new Rating(), {
      updated_at: updatedAt,
      user,
      movie
    });
    try {
      await AppDataSource.getRepository(Rating).save(rating);
      logger.info(`added movie: ${movie.id} to user: ${userId} watchlist`);
    } catch (e) {
      logger.info(`error adding movie: ${movie.id} to user: ${userId}'s watch list`);
      throw new httpError.InternalServerError(`error adding movie: ${movie.id} to user: ${userId}'s watch list`);
    }

    // see if badge should be awarded
    let anyBadgesGiven = false;
    const newBadges: Badge[] = [];
    for (const badge of movie.badges) {
      if (user.badges.some(b => b.id === badge.id)) {
        continue; // user already has badge
      }
      const fullBadge = await this.badgeRepository.findOne({ 
        where: {id: badge.id},
        relations: ['movies']
      });
      let giveBadge = true;
      for (const movieInLoop of fullBadge.movies) {
        if (!user.ratings.some(r => r.movie.id === movieInLoop.id)) {
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
        try {
          user = await this.userRepository.save(user);
          logger.info(`badge: ${badge.id} given to user: ${userId}`);
        } catch (e) {
          logger.info(`error adding badge: ${badge.id} to user: ${userId}'s badge list`);
          throw new httpError.InternalServerError(`error adding badge: ${badge.id} to user: ${userId}'s badge list`);
        }
      }
      anyBadgesGiven = giveBadge;
    }

    const stringifiedBadgeIds = JSON.stringify(newBadges.map(badge => badge.id));
    logger.info(`user: ${userId} has acquired badges: ${stringifiedBadgeIds}`);

    // return badge information (if any) to display on the front end
    return {
      userId,
      movieId,
      ratingId: rating.id,
      badgesAquired: anyBadgesGiven,
      badges: newBadges
    };
  }

  async unwatchMovie(request: Request, response: Response, next: NextFunction) {
    // remove rating record
    const userId = parseInt(request.params.userId);
    if (!userId) {
      logger.info('missing param userId');
      throw new httpError.BadRequest('missing param userId');
    }

    const movieId = parseInt(request.body.movieId);
    if (!movieId) {
      logger.info('missing param movieId');
      throw new httpError.BadRequest('missing param movieId');
    }

    const rating = await this.ratingRepository.findOneBy({
      movie: { id: movieId },
      user: { id: userId }
    });
    if (!rating) {
      logger.info(`rating for user: ${userId} and movie: ${movieId} not found`);
      throw new httpError.NotFound(`rating for user: ${userId} and movie: ${movieId} not found`);
    }

    try {
      await this.ratingRepository.remove(rating);
    } catch (e) {
      logger.info(`error removing rating: ${rating.id}`);
      throw new httpError.InternalServerError(`error removing user: ${rating.id}`);
    }

    // check if any badges to remove
    const movie = await this.movieRepository.findOne({
      where: {id: movieId},
      relations: ['badges']
    });

    let user = await this.userRepository.findOne({
      where: {id: movieId},
      relations: ['badges']
    });

    user.badges = user.badges.filter(
      badge => badge.id !== movie.badges.find(
        b => b.id === badge.id
      )?.id
    );

    try {
      user = await this.userRepository.save(user);
    } catch (e) {
      logger.info(`error saving user: ${user.id}`);
      throw new httpError.InternalServerError(`error saving user: ${user.id}`);
    }
    return user;
  }

  async seenMovies(request: Request, response: Response, next: NextFunction): Promise<Movie[]> {
    const id = parseInt(request.params.id);
    if (!id) {
      logger.info('missing param id');
      throw new httpError.BadRequest('missing param id');
    }

    const user = await this.userRepository.findOne({ 
      relations: ['ratings'],
      where: { id }
    });
    if (!user) {
      logger.info(`user: ${id} not found`);
      throw new httpError.NotFound(`user: ${id} not found`);
    }

    const seenMovies: Movie[] = [];
    for (const rating of user.ratings) {
      const fullRating = await this.ratingRepository.findOne({ 
        where: {id: rating.id},
        relations: ['movies']
      });
      seenMovies.push(fullRating.movie);
    }
    return seenMovies;
  }

  async heldBadges(request: Request, response: Response, next: NextFunction): Promise<Badge[]> {
    const id = parseInt(request.params.id);
    if (!id) {
      logger.info('missing param id');
      throw new httpError.BadRequest('missing param id');
    }

    const user = await this.userRepository.findOne({
      relations: ['badges'],
      where: { id }
    });
    if (!user) {
      logger.info(`user: ${id} not found`);
      throw new httpError.NotFound(`user: ${id} not found`);
    }
    return user.badges;
  }
}