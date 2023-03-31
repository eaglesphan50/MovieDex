import { AppDataSource } from '../data-source';
import { NextFunction, Request, Response } from 'express';
import { Rating } from '../entity/Rating';

export class RatingController {

  private ratingRepository = AppDataSource.getRepository(Rating);

  async one(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);

    const rating = await this.ratingRepository.findOne({
      where: { id }
    });

    if (!rating) {
      return 'unregistered rating';
    }
    return rating;
  }

  async rateMovie(request: Request, response: Response, next: NextFunction) {
    // called when user rates/rerates a movie
  }

  async reviewMovie(request: Request, response: Response, next: NextFunction) {
    // called when a user submits/edits a review
  }

  async ratingsByUser(request: Request, response: Response, next: NextFunction) {
    // return all ratings by a specific user
    // batched?
  }

  async ratingsByMovie(request: Request, response: Response, next: NextFunction) {
    // return all ratings by a specific user
    // batched?
  }
}