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
import { CreateExpensesDto } from './dto/create-expenses.dto';
import { User } from '../user/entities/user.entity';
import { ExpensesService } from './expenses.service';
import { UpdateExpensesDto } from './dto/update-expenses.dto';

@ApiTags('expenses')
@Controller('expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
// @UseGuards(PermissionGuard)
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
    @Inject(REQUEST) private request: Request
  ) {}

  @Post('/create')
  async create(@Body() dto: CreateExpensesDto) {
    const user = this.request.user as User;
    return await this.expensesService.createExpenses(user.id, dto);
  }

  @Post('/update')
  async update(@Body() dto: UpdateExpensesDto) {
    const user = this.request.user as User;
    return await this.expensesService.updateExpenses(user.id, dto);
  }

  @Get('/get-all')
  async getAll() {
    const user = this.request.user as User;
    return await this.expensesService.getAllExpenses(user.id);
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    const user = this.request.user as User;
    return await this.expensesService.getExpenseById(user.id, +id);
  }

  @Delete('/delete/:id')
  async delete(@Param('id') id: string) {
    const user = this.request.user as User;
    return await this.expensesService.deleteExpense(user.id, +id);
  }
}
