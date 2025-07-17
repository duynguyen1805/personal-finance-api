import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateCategoriesDto } from './dto/update-categories.dto';
import { CreateCategoriesUseCase } from './use-cases/create-categories.use-case';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { UpdateCategoriesUseCase } from './use-cases/update-categories.use-case';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categories } from './entities/categories.entity';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly createCategoriesUseCase: CreateCategoriesUseCase,
    private readonly updateCategoriesUseCase: UpdateCategoriesUseCase,
    @InjectRepository(Categories)
    private readonly categoriesRepository: Repository<Categories>
  ) {}

  async createCategories(userId: number, input: CreateCategoriesDto) {
    return await this.createCategoriesUseCase.execute(userId, input);
  }

  async updateCategories(userId: number, input: UpdateCategoriesDto) {
    return await this.updateCategoriesUseCase.execute(userId, input);
  }

  async getAllCategories(userId: number) {
    return await this.categoriesRepository
      .createQueryBuilder('categories')
      .where('categories.userId = :userId', { userId })
      .andWhere('categories.userId = :userId', { userId: 1 })
      .getMany();
  }

  async getCategoryById(userId: number, categoryId: number) {
    return await this.categoriesRepository.findOne({
      where: { userId, categoryId }
    });
  }

  async deleteCategory(userId: number, categoryId: number) {
    const category = await this.categoriesRepository.findOne({
      where: { userId, categoryId }
    });
    if (!category) throw new NotFoundException('Category not found');
    return await this.categoriesRepository.delete({ categoryId });
  }
}
