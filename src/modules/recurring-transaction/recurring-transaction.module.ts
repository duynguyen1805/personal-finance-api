import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecurringTransaction } from './entities/recurring-transaction.entity';
import { RecurringTransactionService } from './recurring-transaction.service';
import { RecurringTransactionController } from './recurring-transaction.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RecurringTransaction])],
  controllers: [RecurringTransactionController],
  providers: [RecurringTransactionService],
  exports: [RecurringTransactionService],
})
export class RecurringTransactionModule {} 