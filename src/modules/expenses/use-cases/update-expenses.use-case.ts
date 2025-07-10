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
import { UpdateExpensesDto } from '../dto/update-expenses.dto';
import { Budgets } from '../../budgets/entities/budgets.entity';
// import { extractMonthYear } from '../../../common/helpers/time-helper';

@Injectable()
export class UpdateExpensesUseCase {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Expenses)
    private expensesRepository: Repository<Expenses>
  ) {}

  async execute(userId: number, dto: UpdateExpensesDto) {
    await this.validateUser(userId);
    return await this.updateCategory(userId, dto);
  }

  async validateUser(userId: number) {
    const user = await this.userRepository.findOne({ id: userId });
    mustExist(
      user,
      EErrorExpenses.CANNOT_FIND_USER,
      EErrorDetail.CANNOT_FIND_USER
    );
  }

  async updateCategory(
    userId: number,
    dto: UpdateExpensesDto
  ): Promise<Expenses> {
    // const { month, year } = extractMonthYear(dto.expenseDate);
    await this.expensesRepository.update(
      {
        userId: userId,
        expenseId: dto.expenseId
      },
      {
        ...dto,
        userId: userId
      }
    );

    return await this.expensesRepository.findOne({
      where: {
        userId: userId,
        expenseId: dto.expenseId
      }
    });
  }
}
