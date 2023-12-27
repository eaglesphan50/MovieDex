import * as httpError from 'http-errors';

import { AppDataSource } from '../data-source';
import { NextFunction, Request, Response } from 'express';
import { Movie } from '../entity/Movie';
import { logger } from '../../lib/logger';
import { TmdbConnection } from '../../lib/connection';
import { AxiosResponse } from 'axios';

export class MovieController {

  private movieRepository = AppDataSource.getRepository(Movie);

  async one(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);
    if (!id) {
      logger.info('missing param id');
      throw new httpError.BadRequest('missing param id');
    }

    const movie = await this.movieRepository.findOneBy({ id });
    if (!movie) {
      logger.info(`movie: ${id} not found in table`);
      throw new httpError.NotFound(`movie: ${id} not found in table`);
    }

    let axiosResponse: AxiosResponse;
    const connection = new TmdbConnection();
    try {
      axiosResponse = await connection.get('movie/' + id);
    } catch (e) {
      logger.info(`error getting movie: ${id}`);
      throw new httpError.InternalServerError(`error getting movie: ${id}`);
    }

    if (axiosResponse.status === 404) {
      logger.info(`movie: ${id} not found in TMDB`);
      throw new httpError.NotFound(`movie: ${id} not found in TMDB`);
    } else if (axiosResponse.status > 200) {
      logger.info(`error getting movie: ${id}`);
      throw new httpError.InternalServerError(`error getting movie: ${id}`);
    }

    const movieData = axiosResponse.data;
    try {
      axiosResponse = await connection.get('movie/' + id + '/credits');
    } catch (e) {
      logger.info(`error getting movie: ${id}`);
      throw new httpError.InternalServerError(`error getting movie: ${id}`);
    }

    if (axiosResponse.status === 404) {
      logger.info(`movie: ${id} not found in TMDB`);
      throw new httpError.NotFound(`movie: ${id} not found in TMDB`);
    } else if (axiosResponse.status > 200) {
      logger.info(`error getting movie: ${id}`);
      throw new httpError.InternalServerError(`error getting movie: ${id}`);
    }
    movieData.cast = axiosResponse?.data?.cast?.slice(0, 10);

    // TODO cache?

    return movieData;
  }
}