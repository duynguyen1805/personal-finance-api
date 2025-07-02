import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { jwtConstants } from './constants';
import { UserService } from '../user/user.service';
import { Cache } from 'cache-manager';
import { flattenDeep, uniq } from 'lodash';
import { CacheService } from '../cache/cache.service';
import { ERedisKey } from '../../database/redis';

@Injectable()
/* It extends the PassportStrategy class and overrides the validate method */
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * The constructor function is used to inject the UserService and CacheManager into the JwtStrategy
   * class
   * @param {UserService} userService - This is the service that we created earlier.
   * @param {Cache} cacheManager - This is the cache manager that we injected in the constructor.
   */
  constructor(
    private userService: UserService,
    private cacheService: CacheService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
      passReqToCallback: true
    });
  }

  /**
   * It takes the payload from the JWT, gets the user's permissions from the cache, and if they're not
   * there, it gets them from the database, and then returns the payload with the permissions added
   * @param {any} payload - The payload that was sent to the server.
   * @returns The payload data, and the permissions.
   */
  async validate(req: Request, payload: any) {
    /* Getting the email and id from the payload.data, then it is getting the permissions from the
    cache. If the permissions are not in the cache, it gets them from the database. */
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace('Bearer ', '');

    // Check blacklist
    const isBlacklisted = await this.cacheService.get(
      `${ERedisKey.BLACKLIST_TOKEN_PREFIX}${token}`
    );
    if (isBlacklisted) {
      throw new UnauthorizedException('Token is blacklisted');
    }

    const { id } = payload.data;
    let permissions: any = await this.cacheService.get(`permissions_${id}`);

    if (!permissions) {
      const user = await this.userService.findOne(id);

      permissions = uniq(
        flattenDeep(
          user.roles.map((role: any) => [
            ...JSON.parse(role.permissions).map((permission) => permission)
          ])
        )
      );

      await this.cacheService.set(`permissions_${id}`, permissions);
    }

    return { ...payload.data, permissions };
  }
}
