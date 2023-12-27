import * as httpError from 'http-errors';

import { AppDataSource } from '../data-source';
import { NextFunction, Request, Response } from 'express';
import { Badge } from '../entity/Badge';
import { logger } from '../../lib/logger';

export class BadgeController {

  private badgeRepository = AppDataSource.getRepository(Badge);

  async all(request: Request, response?: Response, next?: NextFunction) {
    return this.badgeRepository.find();
  }

  async one(request: Request, response?: Response, next?: NextFunction): Promise<Badge> {
    const id = parseInt(request.params.id);
    if (!id) {
      logger.info('missing param id');
      throw new httpError.BadRequest('missing param id');
    }

    const badge = await this.badgeRepository.findOneBy({ id });
    if (!badge) {
      logger.info(`badge: ${id} not found`);
      throw new httpError.NotFound(`badge: ${id} not found`);
    }

    return badge;
  }

  async save(request: Request, response?: Response, next?: NextFunction) {
    // rethink this
  }

  async remove(request: Request, response?: Response, next?: NextFunction): Promise<void> {
    const id = parseInt(request.params.id);
    if (!id) {
      logger.info('missing param id');
      throw new httpError.BadRequest('missing param id');
    }

    const badgeToRemove = await this.badgeRepository.findOneBy({ id });
    if (!badgeToRemove) {
      logger.info(`badge: ${id} not found`);
      throw new httpError.NotFound(`badge: ${id} not found`);
    }

    try {
      await this.badgeRepository.remove(badgeToRemove);
    } catch (e) {
      logger.info(`error removing badge: ${id}`);
      throw new httpError.InternalServerError(`error removing badge: ${id}`);
    }

    return;
  }
}