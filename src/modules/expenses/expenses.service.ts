import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateExpensesDto } from './dto/update-expenses.dto';
import { CreateExpensesUseCase } from './use-cases/create-expenses.use-case';
import { CreateExpensesDto } from './dto/create-expenses.dto';
import { UpdateExpensesUseCase } from './use-cases/update-expenses.use-case';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expenses } from './entities/expenses.entity';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly createExpensesUseCase: CreateExpensesUseCase,
    private readonly updateExpensesUseCase: UpdateExpensesUseCase,
    @InjectRepository(Expenses)
    private readonly expensesRepository: Repository<Expenses>
  ) {}

  async createExpenses(userId: number, input: CreateExpensesDto) {
    return await this.createExpensesUseCase.execute(userId, input);
  }

  async updateExpenses(userId: number, input: UpdateExpensesDto) {
    return await this.updateExpensesUseCase.execute(userId, input);
  }

  async getAllExpenses(userId: number) {
    return await this.expensesRepository.find({ where: { userId } });
  }

  async getExpenseById(userId: number, expenseId: number) {
    return await this.expensesRepository.findOne({
      where: { userId, expenseId }
    });
  }

  async deleteExpense(userId: number, expenseId: number) {
    const expense = await this.expensesRepository.findOne({
      where: { userId, expenseId }
    });
    if (!expense) throw new NotFoundException('Expense not found');
    return await this.expensesRepository.delete({ userId, expenseId });
  }
}
