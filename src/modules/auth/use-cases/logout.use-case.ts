import { Injectable } from '@nestjs/common';
import { ERedisKey } from '../../../database/redis';
import { CacheService } from '../../../modules/cache/cache.service';

@Injectable()
export class LogOutUseCase {
  constructor(private readonly cacheService: CacheService) {}

  async addTokenToBlackList(token: string) {
    // const expriredTime = await this.getExpiredTime(token)
    const blackListToken = `${ERedisKey.BLACKLIST_TOKEN_PREFIX}${token}`;
    // const NONSENSE_VALUE = '';
    // return Redis.set(blackListToken, expriredTime, NONSENSE_VALUE);
    return this.cacheService.set(blackListToken, true);
  }
}
