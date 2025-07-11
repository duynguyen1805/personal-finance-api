import {
  Body,
  Controller,
  Inject,
  Post,
  UseGuards,
  Get,
  Param,
  Delete
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../permission/permissison.guard';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { User } from '../user/entities/user.entity';
import { CategoriesService } from './categories.service';
import { UpdateCategoriesDto } from './dto/update-categories.dto';

@ApiTags('categories')
@Controller('categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseGuards(PermissionGuard)
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    @Inject(REQUEST) private request: Request
  ) {}

  @Post('/create')
  async create(@Body() dto: CreateCategoriesDto) {
    const user = this.request.user as User;
    return await this.categoriesService.createCategories(user.id, dto);
  }

  @Post('/update')
  async update(@Body() dto: UpdateCategoriesDto) {
    const user = this.request.user as User;
    return await this.categoriesService.updateCategories(user.id, dto);
  }

  @Get('/get-all')
  async getAll() {
    const user = this.request.user as User;
    return await this.categoriesService.getAllCategories(user.id);
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    const user = this.request.user as User;
    return await this.categoriesService.getCategoryById(user.id, +id);
  }

  @Delete('/delete/:id')
  async delete(@Param('id') id: string) {
    const user = this.request.user as User;
    return await this.categoriesService.deleteCategory(user.id, +id);
  }
}
