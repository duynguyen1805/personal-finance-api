import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class RmqService {
  constructor(private readonly configService: ConfigService) {}

  getOptions(queue: string, noAck = false, prefetchCount = 1): RmqOptions {
    return {
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get('RABBITMQ_URI').toString()],
        queue: queue,
        noAck,
        prefetchCount,
        persistent: true,
        queueOptions: {
          durable: true
        }
      }
    };
  }

  ack(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
  }
}
