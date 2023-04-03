import * as httpError from 'http-errors';
import moment = require('moment');

import { AppDataSource } from '../data-source';
import { NextFunction, Request, Response } from 'express';
import { Rating } from '../entity/Rating';
import { logger } from '../../lib/logger';

export class RatingController {

  private ratingRepository = AppDataSource.getRepository(Rating);

  async one(request: Request, response: Response, next: NextFunction): Promise<Rating> {
    const id = parseInt(request.params.id);

    logger.info(`getting rating: ${id}`);
    const rating = await this.ratingRepository.findOneBy({ id });

    if (!rating) {
      logger.info(`rating: ${id} not found`);
      throw new httpError.NotFound(`rating: ${id} not found`);
    }
    logger.info(`rating: ${id} found`);

    return rating;
  }

  async rateMovie(request: Request, response: Response, next: NextFunction): Promise<Rating> {
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

    const score = parseInt(request.body.score);
    if (!score) {
      logger.info('missing param score');
      throw new httpError.BadRequest('missing param score');
    }

    const review = request.body.review;
    if (!review) {
      logger.info('missing param review');
      throw new httpError.BadRequest('missing param review');
    }

    let rating = await this.ratingRepository.findOne({
      relations: ['movie', 'user'],
      where: {
        movie: { id: movieId },
        user: { id: userId }
      }
    });
    if (!rating) {
      logger.info(`movie: ${movieId} not watched by user: ${userId}`);
      throw new httpError.NotFound(`movie: ${movieId} not watched by user: ${userId}`); // is this the right error?
    }

    rating = Object.assign(rating, {
      score,
      review,
      updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
    });

    try {
      rating = await this.ratingRepository.save(rating);
    } catch (e) {
      logger.info(`error saving rating: ${rating.id}`);
      throw new httpError.InternalServerError(`error saving rating: ${rating.id}`);
    }
    return rating;
  }

  async ratingsByUser(request: Request, response: Response, next: NextFunction): Promise<Rating[]> {
    const userId = parseInt(request.params.userId);
    if (!userId) {
      logger.info('missing param userId');
      throw new httpError.BadRequest('missing param userId');
    }

    const ratings = await this.ratingRepository.findBy({
      user: { id: userId }
    });
    if (!ratings) {
      logger.info(`user: ${userId} has no ratings`);
      throw new httpError.NotFound(`user: ${userId} has no ratings`);
    }

    return ratings;
  }

  async ratingsByMovie(request: Request, response: Response, next: NextFunction): Promise<Rating[]> {
    const movieId = parseInt(request.params.movieId);
    if (!movieId) {
      logger.info('missing param userId');
      throw new httpError.BadRequest('missing param userId');
    }

    const ratings = await this.ratingRepository.findBy({
      movie: { id: movieId }
    });
    if (!ratings) {
      logger.info(`movie: ${movieId} has no ratings`);
      throw new httpError.NotFound(`movie: ${movieId} has no ratings`);
    }

    return ratings;
  }
}