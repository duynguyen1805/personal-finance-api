import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import {
  makeSure,
  mustExist
} from '../../../common/helpers/server-error.helper';
import { Categories } from '../entities/categories.entity';
import { EErrorCategories, EErrorDetail } from '../enums/categories.enum';
import { UpdateCategoriesDto } from '../dto/update-categories.dto';
import { Budgets } from '../../budgets/entities/budgets.entity';
import { extractMonthYear } from '../../../common/helpers/time-helper';

@Injectable()
export class UpdateCategoriesUseCase {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Categories)
    private categoriesRepository: Repository<Categories>,
    @InjectRepository(Budgets)
    private budgetsRepository: Repository<Budgets>
  ) {}

  async execute(userId: number, dto: UpdateCategoriesDto) {
    await this.validateUser(userId);
    return await this.updateCategory(userId, dto);
  }

  async validateUser(userId: number) {
    const user = await this.userRepository.findOne({ id: userId });
    mustExist(
      user,
      EErrorCategories.CANNOT_FIND_USER,
      EErrorDetail.CANNOT_FIND_USER
    );
  }

  async updateCategory(
    userId: number,
    dto: UpdateCategoriesDto
  ): Promise<Categories> {
    const { month, year } = extractMonthYear(dto.date);
    const category = await this.categoriesRepository.findOne({
      where: { categoryId: dto.categoryId }
    });
    // const budget = await this.budgetsRepository.findOne({
    //   where: { budgetId: category.budgetId }
    // });

    // // nếu budget vẫn đúng tháng thì update
    // if (budget.month == month && budget.year == year) {
    //   await this.categoriesRepository.update(category.categoryId, {
    //     ...dto
    //   });
    // } else {
    //   // thay đổi category qua budget của tháng khác
    //   const budget = await this.budgetsRepository.findOne({
    //     where: { userId: userId, month: month, year: year }
    //   });
    //   if (budget) {
    //     await this.categoriesRepository.update(category.categoryId, {
    //       ...dto,
    //       budgetId: budget.budgetId
    //     });
    //   } else {
    //     // tháng đó chưa có budget thì yêu cầu call api tạo income mới
    //     makeSure(
    //       false,
    //       EErrorCategories.CANNOT_FIND_BUDGET,
    //       EErrorDetail.CANNOT_FIND_BUDGET
    //     );
    //   }
    // }

    return await this.categoriesRepository.findOne({
      where: { categoryId: dto.categoryId }
    });
  }
}
