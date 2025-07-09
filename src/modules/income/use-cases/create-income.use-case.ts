import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { mustExist } from '../../../common/helpers/server-error.helper';
import { Income } from '../entities/income.entity';
import { EErrorIncome, EErrorDetail } from '../enums/income.enum';
import { CreateIncomeDto } from '../dto/create-income.dto';
import { Budgets } from '../../budgets/entities/budgets.entity';
import { extractMonthYear } from '../../../common/helpers/time-helper';

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

  async execute(userId: number, dto: CreateIncomeDto) {
    await this.validateUser(userId);
    await this.updateTotalAmountBudget(userId, dto);
    return await this.incomeRepository.save({
      ...dto,
      userId: userId
    });
  }

  async validateUser(userId: number) {
    const user = await this.userRepository.findOne({ id: userId });
    mustExist(
      user,
      EErrorIncome.CANNOT_FIND_USER,
      EErrorDetail.CANNOT_FIND_USER
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
