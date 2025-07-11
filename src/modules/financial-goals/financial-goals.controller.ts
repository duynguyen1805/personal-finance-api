import { Body, Controller, Inject, Post, UseGuards, Get, Param, Delete, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../permission/permissison.guard';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { FinancialGoalsService } from './financial-goals.service';

@ApiTags('financial-goals')
@Controller('financial-goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseGuards(PermissionGuard)
export class FinancialGoalsController {
  constructor(
    private readonly goalsService: FinancialGoalsService,
    @Inject(REQUEST) private request: Request
  ) {}

  @Post('create')
  @ApiOperation({ summary: 'Create financial goal' })
  @ApiResponse({ status: 201, description: 'Financial goal created successfully.' })
  async create(@Body() dto: any) {
    const user = this.request.user as any;
    return await this.goalsService.createGoal(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update financial goal' })
  @ApiResponse({ status: 200, description: 'Financial goal updated successfully.' })
  async update(@Param('id') id: string, @Body() dto: any) {
    const user = this.request.user as any;
    return await this.goalsService.updateGoal(user.id, +id, dto);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all financial goals' })
  @ApiResponse({ status: 200, description: 'Financial goals fetched successfully.' })
  async getAll() {
    const user = this.request.user as any;
    return await this.goalsService.getAllGoals(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get financial goal by id' })
  @ApiResponse({ status: 200, description: 'Financial goal fetched successfully.' })
  async getOne(@Param('id') id: string) {
    const user = this.request.user as any;
    return await this.goalsService.getGoalById(user.id, +id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete financial goal by id' })
  @ApiResponse({ status: 200, description: 'Financial goal deleted successfully.' })
  async delete(@Param('id') id: string) {
    const user = this.request.user as any;
    return await this.goalsService.deleteGoal(user.id, +id);
  }
}
