import { AppDataSource } from '../data-source';
import { NextFunction, Request, Response } from 'express';
import * as moment from 'moment';
import { Movie } from '../entity/Movie';

export class MovieController {

  private movieRepository = AppDataSource.getRepository(Movie);

  async one(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);

    const movie = await this.movieRepository.findOne({
      where: { id }
    });

    if (!movie) {
      return 'unknown movie';
    }

    // TODO integrate with TMDB here

    return movie;
  }
}