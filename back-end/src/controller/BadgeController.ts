import { AppDataSource } from '../data-source';
import { NextFunction, Request, Response } from 'express';
import * as moment from 'moment';
import { Badge } from '../entity/Badge';
import { Movie } from '../entity/Movie';
import { logger } from '../../lib/logger';

export class BadgeController {

  private badgeRepository = AppDataSource.getRepository(Badge);

  async all(request: Request, response: Response, next: NextFunction) {
    return this.badgeRepository.find();
  }

  async one(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);

    const badge = await this.badgeRepository.findOne({
      where: { id }
    });

    if (!badge) {
      return 'unregistered badge';
    }
    return badge;
  }

  async save(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);
    const { rarity, icon, name, description, movieId } = request.body;
    const movie = await AppDataSource.getRepository(Movie).findOneBy({ id: movieId });
    let badge = await this.badgeRepository.findOneBy({ id });

    const moviesAssociated = badge.movies;
    if (!moviesAssociated.includes(movie)) {
      moviesAssociated.push(movie);
    }

    const updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');

    badge = Object.assign(badge, {
      rarity,
      icon,
      name,
      description,
      movies: moviesAssociated,
      updated_at: updatedAt
    });
    logger.info('saving badge: ' + JSON.stringify(badge));

    return this.badgeRepository.save(badge);
  }

  async remove(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);

    const badgeToRemove = await this.badgeRepository.findOneBy({ id });

    if (!badgeToRemove) {
      return 'this badge not exist';
    }

    await this.badgeRepository.remove(badgeToRemove);

    return 'badge has been removed';
  }

}