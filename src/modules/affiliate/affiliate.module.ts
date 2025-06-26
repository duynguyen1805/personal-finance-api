import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Affiliate } from './entities/affiliate.entity';
import { AffiliateController } from './affiliate.controller';
import { AffiliateService } from './affiliate.service';
import { CommissionService } from './commission.service';
import { Commission } from './entities/commission.entity';
import { CommissionController } from './commission.controller';
import { Income } from './entities/income.entity';
import { TransactionsModule } from '../transactions/transactions.module';
import { Transactions } from '../transactions/entities/transaction.entity';
import { LeadershipService } from './leadership.service';
import { LeadershipController } from './leadership.controller';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Affiliate,
      Commission,
      Income,
      Transactions,
      User,
    ]),
    TransactionsModule
  ],
  controllers: [
    AffiliateController,
    CommissionController,
    LeadershipController
  ],
  providers: [AffiliateService, CommissionService, LeadershipService],
  exports: [AffiliateService, CommissionService]
})
export class AffiliateModule {}
