import { defaultTo } from 'lodash';
import { configService } from 'src/config/config.service';

export enum EEnviroment {
  TEST = 'test',
  LOCAL = 'local',
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
  STAGING = 'staging'
}

export enum ESwitchableFeature {
  SENTRY = 'SENTRY',
  TELEGRAM = 'TELEGRAM',
  SEND_CANDLE_RESULT = 'SEND_CANDLE_RESULT'
}

export function isFeatureDisabled(feature: ESwitchableFeature) {
  return defaultTo(configService.getEnv('DISABLED_FEATURES'), '').includes(
    feature
  );
}
