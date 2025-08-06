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
// import { Budgets } from '../../budgets/entities/budgets.entity';
// import { extractMonthYear } from '../../../common/helpers/time-helper';

@Injectable()
export class UpdateCategoriesUseCase {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Categories)
    private categoriesRepository: Repository<Categories> // @InjectRepository(Budgets) // private budgetsRepository: Repository<Budgets>
  ) {}

  async execute(userId: number, categoryId: number, dto: UpdateCategoriesDto) {
    await this.validateUser(userId, categoryId);
    return await this.updateCategory(userId, categoryId, dto);
  }

  async validateUser(userId: number, categoryId: number) {
    makeSure(!isNaN(userId), EErrorCategories.INVALID_USER_ID);
    makeSure(!isNaN(categoryId), EErrorCategories.INVALID_CATEGORY_ID);
    const user = await this.userRepository.findOne({ id: userId });
    mustExist(
      user,
      EErrorCategories.CANNOT_FIND_USER,
      EErrorDetail.CANNOT_FIND_USER
    );
  }

  async updateCategory(
    userId: number,
    categoryId: number,
    dto: UpdateCategoriesDto
  ): Promise<Categories> {
    const category = await this.categoriesRepository.findOne({
      where: { categoryId: categoryId, userId: userId }
    });

    mustExist(
      category,
      EErrorCategories.CANNOT_FIND_CATEGORY,
      EErrorDetail.CANNOT_FIND_CATEGORY
    );

    await this.categoriesRepository.update(category.categoryId, {
      ...dto
    });

    return await this.categoriesRepository.findOne({
      where: { categoryId: categoryId }
    });
  }
}
