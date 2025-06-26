import { EServiceType } from './common/enums/service-type.enum';
import {
  ERmqPrefetch,
  ERmqQueueName
} from './modules/transactions/dto/enum.dto';

export const rmqConsumerSetting = (appConfigs: any) => {
  let queueConfigs = null;
  switch (appConfigs.get('SERVICE_TYPE')) {
    case EServiceType.TRANSFER_SERVICE:
      queueConfigs = [
        {
          queueName: ERmqQueueName.TRANSFER,
          prefetchCount: +ERmqPrefetch.TRANSFER
        }
      ];
      break;
    case EServiceType.TRANSFER_FEE_SERVICE:
      queueConfigs = [
        {
          queueName: ERmqQueueName.TRANSFER_FEE,
          prefetchCount: +ERmqPrefetch.TRANSFER_FEE
        }
      ];
      break;
  }

  return queueConfigs;
};
