import {
  Body,
  Controller,
  Inject,
  Post,
  UseGuards,
  Get,
  Param,
  Delete,
  Patch
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
import { CreateBudgetDto } from './dto/create-budget.dto';
import { BudgetService } from './budget.service';
import { User } from '../user/entities/user.entity';

@ApiTags('budgets')
@Controller('budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
// @UseGuards(PermissionGuard)
export class BudgetController {
  constructor(
    private readonly budgetService: BudgetService,
    @Inject(REQUEST) private request: Request
  ) {}

  @Post('/create')
  async create(@Body() dto: CreateBudgetDto) {
    const user = this.request.user as User;
    return await this.budgetService.createBudget(user.id, dto);
  }

  @Patch('/update/:id')
  async update(@Param('id') id: string, @Body() dto: CreateBudgetDto) {
    const user = this.request.user as User;
    return await this.budgetService.updateBudget(user.id, +id, dto);
  }

  @Get('/get-all')
  async getAll() {
    const user = this.request.user as User;
    return await this.budgetService.getAllBudgets(user.id);
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    const user = this.request.user as User;
    return await this.budgetService.getBudgetById(user.id, +id);
  }

  @Delete('/delete/:id')
  async delete(@Param('id') id: string) {
    const user = this.request.user as User;
    return await this.budgetService.deleteBudget(user.id, +id);
  }
}
