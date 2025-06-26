import { Controller, Get, Inject, Param, Put, UseGuards } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../user/entities/user.entity';
import { CommissionService } from './commission.service';

@ApiTags('commission')
@Controller('commission')
export class CommissionController {
  constructor(
    private readonly commissionService: CommissionService,

    @Inject(REQUEST) private request: Request
  ) {}

  @Get('reward/all')
  getRewards() {
    return this.commissionService.getRewards();
  }

  @Get('history')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getCommissionHistory() {
    const user = this.request.user as User;
    return this.commissionService.getCommissionHistory(user.walletAddress);
  }

  // @Get(':address')
  // getTree(@Param('address') address: string) {
  //   return this.commissionService.getTotalCommission(address);
  // }

  // @Put('weak-branch/:address')
  // doWeakBranchComm(@Param('address') address: string) {
  //   return this.commissionService.saveWeakBranchComm(
  //     address,
  //     'Manual update',
  //     ''
  //   );
  // }

  // @Post('job')
  // updateWeakBranchCommission() {
  //   return this.commissionService.updateWeakBranchCommission();
  // }

  // @Post('weak-branch')
  // doWeakBranchCommission() {
  //   return this.commissionService.doWeakBranchCommission();
  // }

  // @Post('direct-f1')
  // doDirectF1Commission() {
  //   return this.commissionService.doDirectF1Commission();
  // }
}
