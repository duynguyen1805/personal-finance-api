import { Injectable } from '@nestjs/common';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { CreateIncomeUseCase } from './use-cases/create-income.use-case';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeUseCase } from './use-cases/update-income.use-case';

@Injectable()
export class IncomeService {
  constructor(
    private readonly createIncomeUseCase: CreateIncomeUseCase,
    private readonly updateIncomeUseCase: UpdateIncomeUseCase
  ) {}

  async createIncome(userId: number, input: CreateIncomeDto) {
    return this.createIncomeUseCase.execute(userId, input);
  }

  async updateIncome(userId: number, input: UpdateIncomeDto) {
    return this.updateIncomeUseCase.execute(userId, input);
  }
}
