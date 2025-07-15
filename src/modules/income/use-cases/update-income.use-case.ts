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
import { UpdateIncomeDto } from '../dto/update-income.dto';
import { extractMonthYear } from '../../../common/helpers/time-helper';

@Injectable()
export class UpdateIncomeUseCase {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Income)
    private incomeRepository: Repository<Income>
  ) {}

  async execute(userId: number, incomeId: number, dto: UpdateIncomeDto) {
    await this.validateUser(userId);
    await this.validateInput(incomeId, dto);
    const { month, year } = extractMonthYear(dto.date);
    await this.incomeRepository.update(
      { userId: userId, incomeId: incomeId },
      {
        ...dto,
        userId: userId,
        month: month,
        year: year
      }
    );
    return await this.incomeRepository.findOne({
      where: { incomeId: incomeId }
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

  async validateInput(incomeId: number, dto: UpdateIncomeDto) {
    makeSure(!isNaN(incomeId), EErrorIncome.INVALID_INCOME_ID);
    makeSure(!isNaN(dto.amount), EErrorIncome.INVALID_AMOUNT);
    makeSure(
      Object.keys(EIncomeTypeSourceName).includes(dto.sourceName),
      EErrorIncome.INVALID_SOURCE_NAME
    );
    const income = await this.incomeRepository.findOne({ incomeId: incomeId });
    mustExist(
      income,
      EErrorIncome.CANNOT_FIND_INCOME,
      EErrorDetail.CANNOT_FIND_INCOME
    );
  }
}
