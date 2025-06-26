import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RmqService } from './rmq.service';

interface RmqModuleOptions {
  name?: string;
  queueName?: string;
  prefetchCount?: number;
}

@Module({
  providers: [RmqService],
  exports: [RmqService]
})
export class RmqModule {
  static register(
    queueConfigs: RmqModuleOptions | RmqModuleOptions[]
  ): DynamicModule[] {
    if (!Array.isArray(queueConfigs)) {
      queueConfigs = [queueConfigs];
    }

    const modules = [];
    for (const configService of queueConfigs) {
      modules.push(this.initRmqSetting(configService));
    }

    return modules;
  }

  static initRmqSetting({
    name,
    queueName,
    prefetchCount = 1
  }: RmqModuleOptions): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name: name ?? 'RMQ_SERVICE',
            useFactory: (configService: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                isGlobalPrefetchCount: true,
                urls: [configService.get('RABBITMQ_URI').toString()],
                queue: queueName ?? configService.get('RABBITMQ_QUEUE_NAME'),
                noAck: true,
                prefetchCount: prefetchCount ?? 1,
                queueOptions: {
                  durable: true
                }
              }
            }),
            inject: [ConfigService]
          }
        ])
      ],
      exports: [ClientsModule]
    };
  }
}
