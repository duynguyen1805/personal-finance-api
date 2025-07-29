import {
  Body,
  Controller,
  Inject,
  Post,
  UseGuards,
  Get,
  Param,
  Delete,
  Patch,
  Query
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../permission/permissison.guard';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { FinancialGoalsService } from './financial-goals.service';
import { CreateFinancialGoalDto } from './dto/create-financial-goal.dto';
import { UpdateFinancialGoalDto } from './dto/update-financial-goal.dto';
import { FinancialGoalResponseDto } from './dto/financial-goal-response.dto';

@ApiTags('financial-goals')
@Controller('financial-goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
// @UseGuards(PermissionGuard)
export class FinancialGoalsController {
  constructor(
    private readonly goalsService: FinancialGoalsService,
    @Inject(REQUEST) private request: Request
  ) {}

  @Post('/create')
  @ApiOperation({ summary: 'Create financial goal' })
  @ApiResponse({
    status: 201,
    description: 'Financial goal created successfully.',
    type: FinancialGoalResponseDto
  })
  async create(@Body() dto: CreateFinancialGoalDto) {
    const user = this.request.user as any;
    return await this.goalsService.createGoal(user.id, dto);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update financial goal' })
  @ApiParam({ name: 'id', description: 'Financial goal ID' })
  @ApiResponse({
    status: 200,
    description: 'Financial goal updated successfully.',
    type: FinancialGoalResponseDto
  })
  async update(@Param('id') id: string, @Body() dto: UpdateFinancialGoalDto) {
    const user = this.request.user as any;
    return await this.goalsService.updateGoal(user.id, +id, dto);
  }

  @Get('/get-all')
  @ApiOperation({ summary: 'Get all financial goals' })
  @ApiResponse({
    status: 200,
    description: 'Financial goals fetched successfully.',
    type: [FinancialGoalResponseDto]
  })
  async getAll() {
    const user = this.request.user as any;
    return await this.goalsService.getAllGoals(user.id);
  }

  @Get('/upcoming')
  @ApiOperation({ summary: 'Get upcoming financial goals' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to look ahead',
    example: 30
  })
  @ApiResponse({
    status: 200,
    description: 'Upcoming financial goals fetched successfully.',
    type: [FinancialGoalResponseDto]
  })
  async getUpcoming(@Query('days') days?: string) {
    const user = this.request.user as any;
    const daysNumber = days ? parseInt(days) : 30;
    return await this.goalsService.getUpcomingDeadlines(user.id, daysNumber);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get financial goal by id' })
  @ApiParam({ name: 'id', description: 'Financial goal ID' })
  @ApiResponse({
    status: 200,
    description: 'Financial goal fetched successfully.',
    type: FinancialGoalResponseDto
  })
  async getOne(@Param('id') id: string) {
    const user = this.request.user as any;
    return await this.goalsService.getGoalById(user.id, +id);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete financial goal by id' })
  @ApiParam({ name: 'id', description: 'Financial goal ID' })
  @ApiResponse({
    status: 200,
    description: 'Financial goal deleted successfully.'
  })
  async delete(@Param('id') id: string) {
    const user = this.request.user as any;
    return await this.goalsService.deleteGoal(user.id, +id);
  }
}
