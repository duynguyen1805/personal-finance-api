import { Injectable } from '@nestjs/common';
import { UpdateCategoriesDto } from './dto/update-categories.dto';
import { CreateCategoriesUseCase } from './use-cases/create-categories.use-case';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { UpdateCategoriesUseCase } from './use-cases/update-categories.use-case';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly createCategoriesUseCase: CreateCategoriesUseCase,
    private readonly updateCategoriesUseCase: UpdateCategoriesUseCase
  ) {}

  async createCategories(userId: number, input: CreateCategoriesDto) {
    return this.createCategoriesUseCase.execute(userId, input);
  }

  async updateCategories(userId: number, input: UpdateCategoriesDto) {
    return this.updateCategoriesUseCase.execute(userId, input);
  }
}
