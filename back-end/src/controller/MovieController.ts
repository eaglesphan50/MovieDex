import { AppDataSource } from '../data-source';
import { NextFunction, Request, Response } from 'express';
import * as moment from 'moment';
import { Movie } from '../entity/Movie';

export class MovieController {

  private movieRepository = AppDataSource.getRepository(Movie);

  async all(request: Request, response: Response, next: NextFunction) {
    return this.movieRepository.find();
  }

  async one(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);

    const movie = await this.movieRepository.findOne({
      where: { id }
    });

    if (!movie) {
      return 'unknown movie';
    }
    return movie;
  }

  async save(request: Request, response: Response, next: NextFunction) {
    return this.movieRepository.save(new Movie());
  }

  async remove(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);

    const movieToRemove = await this.movieRepository.findOneBy({ id });

    if (!movieToRemove) {
      return 'this movie not exist';
    }

    await this.movieRepository.remove(movieToRemove);

    return 'movie has been removed';
  }

}