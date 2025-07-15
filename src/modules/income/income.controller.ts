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
import { CreateIncomeDto } from './dto/create-income.dto';
import { User } from '../user/entities/user.entity';
import { IncomeService } from './income.service';
import { UpdateIncomeDto } from './dto/update-income.dto';

@ApiTags('income')
@Controller('income')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
// @UseGuards(PermissionGuard)
export class IncomeController {
  constructor(
    private readonly incomeService: IncomeService,
    @Inject(REQUEST) private request: Request
  ) {}

  @Post('/create')
  @ApiOperation({ summary: 'Create income' })
  @ApiResponse({ status: 201, description: 'Income created successfully.' })
  async create(@Body() dto: CreateIncomeDto) {
    const user = this.request.user as User;
    return await this.incomeService.createIncome(user.id, dto);
  }

  @Post('/update/:incomeId')
  //   @ApiOperation({ summary: 'Update income' })
  //   @ApiResponse({ status: 200, description: 'Income updated successfully.' })
  async update(
    @Param('incomeId') incomeId: string,
    @Body() dto: UpdateIncomeDto
  ) {
    const user = this.request.user as User;
    return await this.incomeService.updateIncome(user.id, +incomeId, dto);
  }

  @Get('/get-all')
  //   @ApiOperation({ summary: 'Get all incomes' })
  //   @ApiResponse({ status: 200, description: 'Incomes fetched successfully.' })
  async getAll() {
    const user = this.request.user as User;
    return await this.incomeService.getAllIncome(user.id);
  }

  @Get('/:incomeId')
  //   @ApiOperation({ summary: 'Get income by id' })
  //   @ApiResponse({ status: 200, description: 'Income fetched successfully.' })
  async getOne(@Param('incomeId') incomeId: string) {
    const user = this.request.user as User;
    return await this.incomeService.getIncomeById(user.id, +incomeId);
  }

  @Delete('/:incomeId')
  //   @ApiOperation({ summary: 'Delete income by id' })
  //   @ApiResponse({ status: 200, description: 'Income deleted successfully.' })
  async delete(@Param('incomeId') incomeId: string) {
    const user = this.request.user as User;
    return await this.incomeService.deleteIncome(user.id, +incomeId);
  }
}
