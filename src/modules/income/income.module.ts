import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Income } from './entities/income.entity';
import { IncomeService } from './income.service';
import { IncomeController } from './income.controller';
import { Budgets } from '../budgets/entities/budgets.entity';
import { CreateIncomeUseCase } from './use-cases/create-income.use-case';
import { UpdateIncomeUseCase } from './use-cases/update-income.use-case';
import { GetsIncomeUseCase } from './use-cases/gets-income.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([Income, Budgets, User])],
  controllers: [IncomeController],
  providers: [
    IncomeService,
    GetsIncomeUseCase,
    CreateIncomeUseCase,
    UpdateIncomeUseCase
  ],
  exports: [IncomeService]
})
export class IncomeModule {}
