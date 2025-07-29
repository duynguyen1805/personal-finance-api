import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialGoals } from './entities/financial-goals.entity';
import { FinancialGoalsService } from './financial-goals.service';
import { FinancialGoalsController } from './financial-goals.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialGoals])],
  controllers: [FinancialGoalsController],
  providers: [FinancialGoalsService],
  exports: [FinancialGoalsService]
})
export class FinancialGoalsModule {}
