// import redis from 'redis';
// import { createClient } from 'redis';
// import { configService } from '../config/config.service';
// import { promisify } from 'util';

// // const redisClient = createClient({
// //   url: `redis://${configService.getEnv('REDIS_HOST')}:${configService.getEnv(
// //     'REDIS_PORT'
// //   )}`
// // });

// const redisClient = redis.createClient({
//   socket: {
//     host: configService.getEnv('REDIS_HOST'),
//     port: parseInt(configService.getEnv('REDIS_PORT'))
//   }
// });

export enum ERedisKey {
  LATEST_NOTIFIED_BALANCE_CHANGE_TRANSACTION_ID = 'LATEST_NOTIFIED_BALANCE_CHANGE_TRANSACTION_ID',
  LATEST_ETHEREUM_BLOCK = 'LATEST_ETHEREUM_BLOCK',
  BLACKLIST_TOKEN_PREFIX = 'blacklist-token:',
  NEXT_TIME_PROCESS_DAILY_PAYMENT = 'NEXT_TIME_PROCESS_DAILY_PAYMENT',
  LAST_DOWN_ONLY_EVALUATE_RANK = 'LAST_DOWN_ONLY_EVALUATE_RANK',
  CURRENT_PAYMENT_PERIOD_STARTED_AT = 'CURRENT_PAYMENT_PERIOD_STARTED_AT',
  LAST_ORDER_ID_UPDATED_VOLUME = 'LAST_ORDER_ID_UPDATED_VOLUME',
  GAME_INTERVENTION_LIMIT = 'GAME_INTERVENTION_LIMIT',
  GAME_BUDGET_LIMIT = 'GAME_BUDGET_LIMIT',
  GAME_BUDGET_PERCENT = 'GAME_BUDGET_PERCENT',
  GAME_BUDGET_WIN_AMOUNT = 'GAME_BUDGET_WIN_AMOUNT',
  GAME_BUDGET_LOSE_AMOUNT = 'GAME_BUDGET_LOSE_AMOUNT',
  DRIVED_FEEDER_STATE = 'DRIVED_FEEDER_STATE',
  LAST_N_FINAL_CANDLES = 'LAST_N_FINAL_CANDLES',
  CURRENT_COLLECT_USDT_TRANSACTION = 'CURRENT_COLLECT_USDT_TRANSACTION',
  LAST_DAILY_REPORT = 'LAST_DAILY_REPORT',
  CURRENT_MODE = 'CURRENT_MODE',
  LAST_BLOCK_NFT = 'LAST_BLOCK_NFT'
}

// export class Redis {
//   static set(key: string, seconds: number, value: string) {
//     if (seconds === 0)
//       return promisify(redisClient.set).bind(redisClient)(key, value);
//     return promisify(redisClient.setEx).bind(redisClient)(key, seconds, value);
//   }

//   static get(key: string) {
//     return promisify(redisClient.get).bind(redisClient)(key);
//   }

//   static async count(pattern: string) {
//     const records = await promisify(redisClient.keys).bind(redisClient)(
//       pattern
//     );
//     return records.length;
//   }

//   static del(key: string) {
//     return redisClient.del(key);
//   }

//   static setJson<T>(key: string, seconds: number, value: T) {
//     return this.set(key, seconds, JSON.stringify(value));
//   }

//   static async getJson<T>(key: string): Promise<T> {
//     const value = await this.get(key);
//     return JSON.parse(value);
//   }

//   static async flushall() {
//     return promisify(redisClient.flushAll).bind(redisClient)();
//   }
// }
