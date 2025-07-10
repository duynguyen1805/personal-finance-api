import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Expenses } from './entities/expenses.entity';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { Budgets } from '../budgets/entities/budgets.entity';
import { CreateExpensesUseCase } from './use-cases/create-expenses.use-case';
import { UpdateExpensesUseCase } from './use-cases/update-expenses.use-case';
import { Categories } from '../categories/entities/categories.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expenses, Budgets, Categories, User])],
  controllers: [ExpensesController],
  providers: [ExpensesService, CreateExpensesUseCase, UpdateExpensesUseCase],
  exports: [ExpensesService]
})
export class ExpensesModule {}
