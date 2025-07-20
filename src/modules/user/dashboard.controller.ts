import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { DashboardService } from './dashboard.service';
import { User } from './entities/user.entity';

@ApiTags('user-dashboard')
@Controller('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    @Inject(REQUEST) private request: Request
  ) {}

  @Get()
  async getDashboard() {
    const user = this.request.user as User;
    return await this.dashboardService.getDashboardData(user.id);
  }
}
