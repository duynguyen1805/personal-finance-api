import { Injectable } from '@nestjs/common';
import { UpdateExpensesDto } from './dto/update-expenses.dto';
import { CreateExpensesUseCase } from './use-cases/create-expenses.use-case';
import { CreateExpensesDto } from './dto/create-expenses.dto';
import { UpdateExpensesUseCase } from './use-cases/update-expenses.use-case';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly createExpensesUseCase: CreateExpensesUseCase,
    private readonly updateExpensesUseCase: UpdateExpensesUseCase
  ) {}

  async createExpenses(userId: number, input: CreateExpensesDto) {
    return this.createExpensesUseCase.execute(userId, input);
  }

  async updateExpenses(userId: number, input: UpdateExpensesDto) {
    return this.updateExpensesUseCase.execute(userId, input);
  }
}
