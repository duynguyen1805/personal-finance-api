import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { mustExist } from '../../../common/helpers/server-error.helper';
import { Income } from '../entities/income.entity';
import { EErrorIncome, EErrorDetail } from '../enums/income.enum';
import { CreateIncomeDto } from '../dto/create-income.dto';
import { extractMonthYear } from '../../../common/helpers/time-helper';
import { IIncomeGetAllOutput } from '../interface/income.interface';

@Injectable()
export class GetsIncomeUseCase {
  constructor(
    @InjectRepository(Income)
    private incomeRepository: Repository<Income>
  ) {}

  async execute(userId: number): Promise<IIncomeGetAllOutput> {
    const incomes = await this.incomeRepository.find({
      where: { userId }
    });
    const totalResult = await this.incomeRepository
      .createQueryBuilder('income')
      .select('SUM(income.amount)', 'total')
      .where('income.userId = :userId', { userId })
      .getRawOne();

    return {
      incomes: incomes,
      totalIncome: totalResult.total
    };
  }
}
