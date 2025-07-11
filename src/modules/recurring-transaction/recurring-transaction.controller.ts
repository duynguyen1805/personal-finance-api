import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Inject
} from '@nestjs/common';
import { RecurringTransactionService } from './recurring-transaction.service';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../permission/permissison.guard';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { User } from '../user/entities/user.entity';

@ApiTags('recurring-transaction')
@Controller('recurring-transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseGuards(PermissionGuard)
export class RecurringTransactionController {
  constructor(
    private readonly service: RecurringTransactionService,
    @Inject(REQUEST) private request: Request
  ) {}

  @Post('/create')
  create(@Body() dto: CreateRecurringTransactionDto) {
    return this.service.create(dto);
  }

  @Get('/get-all')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch('/update/:id')
  update(@Param('id') id: string, @Body() dto: UpdateRecurringTransactionDto) {
    const user = this.request.user as User;
    return this.service.update(user.id, +id, dto);
  }

  @Delete('/delete/:id')
  remove(@Param('id') id: string) {
    const user = this.request.user as User;
    return this.service.remove(user.id, +id);
  }
}
