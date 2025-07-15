import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { CreateIncomeUseCase } from './use-cases/create-income.use-case';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeUseCase } from './use-cases/update-income.use-case';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Income } from './entities/income.entity';
import { IIncomeCreateOutput } from './interface/income.interface';

@Injectable()
export class IncomeService {
  constructor(
    private readonly createIncomeUseCase: CreateIncomeUseCase,
    private readonly updateIncomeUseCase: UpdateIncomeUseCase,
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>
  ) {}

  async createIncome(
    userId: number,
    input: CreateIncomeDto
  ): Promise<IIncomeCreateOutput> {
    return await this.createIncomeUseCase.execute(userId, input);
  }

  async updateIncome(
    userId: number,
    incomeId: number,
    input: UpdateIncomeDto
  ): Promise<Income> {
    return await this.updateIncomeUseCase.execute(userId, incomeId, input);
  }

  async getAllIncome(userId: number) {
    return await this.incomeRepository.find({ where: { userId } });
  }

  async getIncomeById(userId: number, incomeId: number) {
    return await this.incomeRepository.findOne({
      where: { userId, incomeId }
    });
  }

  async deleteIncome(userId: number, incomeId: number) {
    const income = await this.incomeRepository.findOne({
      where: { userId, incomeId }
    });
    if (!income) throw new NotFoundException('Income not found');
    return await this.incomeRepository.delete({ userId, incomeId });
  }
}
