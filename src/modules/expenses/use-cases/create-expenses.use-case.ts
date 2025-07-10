import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { mustExist } from '../../../common/helpers/server-error.helper';
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

  async validateUser(userId: number) {
    const user = await this.userRepository.findOne({ id: userId });
    mustExist(
      user,
      EErrorExpenses.CANNOT_FIND_USER,
      EErrorDetail.CANNOT_FIND_USER
    );
  }

  async execute(userId: number, dto: CreateExpensesDto) {
    await this.validateUser(userId);
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
