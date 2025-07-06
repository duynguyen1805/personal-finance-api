import * as Sentry from '@sentry/node';
import { configService } from '../../config/config.service';
import { ESwitchableFeature, isFeatureDisabled } from '../helpers/env.helper';

const shouldCaptureBySentry = !isFeatureDisabled(ESwitchableFeature.SENTRY);

if (shouldCaptureBySentry) {
  Sentry.init({
    dsn: configService.getEnv('SENTRY_DSN'),
    environment: configService.getEnv('NODE_ENV'),
    beforeSend(event) {
      const errorMessage = event.exception.values[0].value;
      //   Telegram.sendBugReport(
      //     `<b>BUG ${configService.getEnv('NODE_ENV')}</b> ${errorMessage}`
      //   );
      return event;
    }
  });
}

export function handleUnexpectedError(error: Error) {
  console.log(error);
  if (shouldCaptureBySentry) return Sentry.captureException(error);
}
