import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import {
  makeSure,
  mustExist
} from '../../../common/helpers/server-error.helper';
import { Expenses } from '../entities/expenses.entity';
import { EErrorExpenses, EErrorDetail } from '../enums/expenses.enum';
import { CreateExpensesDto } from '../dto/create-expenses.dto';
import { Budgets } from '../../budgets/entities/budgets.entity';
// import { extractMonthYear } from '../../../common/helpers/time-helper';

@Injectable()
export class CreateExpensesUseCase {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Expenses)
    private expensesRepository: Repository<Expenses>,
    @InjectRepository(Budgets)
    private budgetsRepository: Repository<Budgets>
  ) {}

  async validateInput(dto: CreateExpensesDto) {
    makeSure(!isNaN(dto.amount), EErrorExpenses.INVALID_AMOUNT);
    makeSure(!isNaN(dto.budgetId), EErrorExpenses.INVALID_BUDGET_ID);
  }

  async execute(userId: number, dto: CreateExpensesDto) {
    await this.validateInput(dto);
    await this.createExpenses(userId, dto);
    return await this.expensesRepository.save({
      ...dto,
      userId: userId
    });
  }

  async createExpenses(
    userId: number,
    dto: CreateExpensesDto
  ): Promise<Expenses> {
    // const { month, year } = extractMonthYear(dto.expenseDate);
    return await this.expensesRepository.save({
      ...dto,
      userId: userId
    });
  }
}
