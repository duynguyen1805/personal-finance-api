import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Categories } from './entities/categories.entity';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Budgets } from '../budgets/entities/budgets.entity';
import { CreateCategoriesUseCase } from './use-cases/create-categories.use-case';
import { UpdateCategoriesUseCase } from './use-cases/update-categories.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([Categories, Budgets, User])],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    CreateCategoriesUseCase,
    UpdateCategoriesUseCase
  ],
  exports: [CategoriesService]
})
export class CategoriesModule {}
