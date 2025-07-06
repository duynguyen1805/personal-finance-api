import { Body, Controller, Inject, Post, UseGuards, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../permission/permissison.guard';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CreateIncomeDto } from './dto/create-income.dto';
import { User } from '../user/entities/user.entity';
import { IncomeService } from './income.service';

@ApiTags('income')
@Controller('income')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseGuards(PermissionGuard)
export class IncomeController {
  constructor(
    private readonly incomeService: IncomeService,
    @Inject(REQUEST) private request: Request
  ) {}

  @Post('create')
  async create(@Body() dto: CreateIncomeDto) {
    const user = this.request.user as User;
    return await this.incomeService.createIncome(user.id, dto);
  }
}
