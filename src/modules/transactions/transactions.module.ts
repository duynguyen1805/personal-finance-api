import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { Transactions } from './entities/transaction.entity';
import { CustomeCacheModule } from '../cache/cache.module';
import { TransactionsController } from './transactions.controller';
import { RmqModule } from '../rmq/rmq.module';
import { ERmqPrefetch, ERmqQueueName } from './dto/enum.dto';
import { TransactionConsumer } from './consumers/transaction.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transactions]),
    CustomeCacheModule,
    ...RmqModule.register([
      {
        name: ERmqQueueName.TRANSACTION,
        queueName: ERmqQueueName.TRANSACTION,
        prefetchCount: ERmqPrefetch.TRANSACTION
      },
      {
        name: ERmqQueueName.TRANSFER,
        queueName: ERmqQueueName.TRANSFER,
        prefetchCount: ERmqPrefetch.TRANSFER
      },
      {
        name: ERmqQueueName.TRANSFER_FEE,
        queueName: ERmqQueueName.TRANSFER_FEE,
        prefetchCount: ERmqPrefetch.TRANSFER_FEE
      }
    ])
  ],
  controllers: [TransactionsController, TransactionConsumer],
  providers: [TransactionsService],
  exports: [TransactionsService]
})
export class TransactionsModule {}
