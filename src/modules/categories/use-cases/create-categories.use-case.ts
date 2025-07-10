import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { mustExist } from '../../../common/helpers/server-error.helper';
import { Categories } from '../entities/categories.entity';
import { EErrorCategories, EErrorDetail } from '../enums/categories.enum';
import { CreateCategoriesDto } from '../dto/create-categories.dto';
import { Budgets } from '../../budgets/entities/budgets.entity';
import { extractMonthYear } from '../../../common/helpers/time-helper';

@Injectable()
export class CreateCategoriesUseCase {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Categories)
    private categoriesRepository: Repository<Categories>,
    @InjectRepository(Budgets)
    private budgetsRepository: Repository<Budgets>
  ) {}

  async execute(userId: number, dto: CreateCategoriesDto) {
    await this.validateUser(userId);
    await this.createCategory(userId, dto);
    return await this.categoriesRepository.save({
      ...dto,
      userId: userId
    });
  }

  async validateUser(userId: number) {
    const user = await this.userRepository.findOne({ id: userId });
    mustExist(
      user,
      EErrorCategories.CANNOT_FIND_USER,
      EErrorDetail.CANNOT_FIND_USER
    );
  }

  async createCategory(
    userId: number,
    dto: CreateCategoriesDto
  ): Promise<Categories> {
    const { month, year } = extractMonthYear(dto.date);
    const budget = await this.budgetsRepository.findOne({
      where: { userId: userId, month: month, year: year }
    });
    return await this.categoriesRepository.save({
      ...dto,
      userId: userId,
      budgetId: budget.budgetId
    });
  }
}
