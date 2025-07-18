import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import {
  makeSure,
  mustExist
} from '../../../common/helpers/server-error.helper';
import { Income } from '../entities/income.entity';
import {
  EErrorIncome,
  EErrorDetail,
  EIncomeTypeSourceName
} from '../enums/income.enum';
import { CreateIncomeDto } from '../dto/create-income.dto';
import { Budgets } from '../../budgets/entities/budgets.entity';
import { extractMonthYear } from '../../../common/helpers/time-helper';
import { IIncomeCreateOutput } from '../interface/income.interface';

@Injectable()
export class CreateIncomeUseCase {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Income)
    private incomeRepository: Repository<Income>,
    @InjectRepository(Budgets)
    private budgetsRepository: Repository<Budgets>
  ) {}

  async execute(
    userId: number,
    dto: CreateIncomeDto
  ): Promise<IIncomeCreateOutput> {
    await this.validateInput(dto);
    const incomes = await this.incomeRepository.save({
      ...dto,
      userId: userId
    });
    const totalResult = await this.incomeRepository
      .createQueryBuilder('income')
      .select('SUM(income.amount)', 'total')
      .where('income.userId = :userId', { userId })
      .getRawOne();

    return {
      income: incomes,
      totalIncome: totalResult.total || 0
    };
  }

  async validateInput(dto: CreateIncomeDto) {
    makeSure(!isNaN(dto.amount), EErrorIncome.INVALID_AMOUNT);
    makeSure(
      Object.keys(EIncomeTypeSourceName).includes(dto.sourceName),
      EErrorIncome.INVALID_SOURCE_NAME
    );
  }

  async updateTotalAmountBudget(
    userId: number,
    dto: CreateIncomeDto
  ): Promise<Budgets> {
    const { month, year } = extractMonthYear(dto.date);
    const budget = await this.budgetsRepository.findOne({
      where: { userId: userId, month: month, year: year }
    });
    if (budget) {
      await this.budgetsRepository.update(budget.budgetId, {
        totalAmount: budget.totalAmount + dto.amount
      });
      return await this.budgetsRepository.findOne({
        where: { budgetId: budget.budgetId }
      });
    } else {
      return await this.budgetsRepository.save({
        userId: userId,
        totalAmount: dto.amount,
        date: dto.date,
        month: month,
        year: year
      });
    }
  }
}
