import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { FetchTransDto } from './dto/FetchTrans.dto';
import { REQUEST } from '@nestjs/core';
import { User } from '../user/entities/user.entity';
import { Request } from 'express';
import { WithdrawProfitDto } from './dto/withdraw-profit.dto';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { WithdrawCommissionDto } from './dto/withdraw-commission.dto';
@ApiTags('transactions')
@Controller('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    @Inject(REQUEST) private request: Request
  ) {}

  @Get('all')
  findAll(@Query() query: FetchTransDto) {
    return this.transactionsService.findAll(query);
  }

  @Get('balances')
  findBalance() {
    const userId = (this.request.user as User).id;
    return this.transactionsService.getBalance(userId);
  }

  @Get('balances')
  find() {
    const userId = (this.request.user as User).id;
    return this.transactionsService.getBalance(userId);
  }

  @Post('withdraw/profit')
  withdrawnProfit(@Body() dto: WithdrawProfitDto) {
    const currentUser = this.request.user as User;
    return this.transactionsService.withdrawnProfit(currentUser, dto);
  }

  @Post('withdraw/commission')
  withdrawnCommission(@Body() dto: WithdrawCommissionDto) {
    const currentUser = this.request.user as User;
    return this.transactionsService.withdrawnCommission(currentUser, dto);
  }

  @Post('withdraw/profit/fake')
  @UseGuards(ApiKeyGuard)
  fakeWithdrawProfit(@Body() dto: WithdrawProfitDto) {
    const currentUser = this.request.user as User;
    return this.transactionsService.withdrawnProfit(currentUser, dto, true);
  }

  @Post('withdraw/commission/fake')
  @UseGuards(ApiKeyGuard)
  fakeWithdrawComm(@Body() dto: WithdrawProfitDto) {
    const currentUser = this.request.user as User;
    return this.transactionsService.withdrawnCommission(currentUser, dto, true);
  }
}
