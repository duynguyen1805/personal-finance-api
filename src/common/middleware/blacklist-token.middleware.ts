import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../../../src/modules/cache/cache.service';

@Injectable()
export class BlacklistMiddleware implements NestMiddleware {
  constructor(private cacheService: CacheService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace('Bearer ', '');
    if (token) {
      const isBlacklisted = await this.cacheService.get(`blacklist_${token}`);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token is blacklisted');
      }
    }
    next();
  }
}