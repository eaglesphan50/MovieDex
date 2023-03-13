import { AppDataSource } from '../data-source';
import { NextFunction, Request, Response } from 'express';
import * as moment from 'moment';
import { Badge } from '../entity/Badge';

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
    const { rarity, icon, name, description } = request.body;

    const updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');

    const badge = Object.assign(new Badge(), {
      rarity,
      icon,
      name,
      description,
      updated_at: updatedAt
    });

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