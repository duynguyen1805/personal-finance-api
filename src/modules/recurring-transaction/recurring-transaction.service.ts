import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecurringTransaction } from './entities/recurring-transaction.entity';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';

@Injectable()
export class RecurringTransactionService {
  constructor(
    @InjectRepository(RecurringTransaction)
    private readonly recurringRepo: Repository<RecurringTransaction>
  ) {}

  async create(
    dto: CreateRecurringTransactionDto
  ): Promise<RecurringTransaction> {
    const entity = this.recurringRepo.create(dto);
    return this.recurringRepo.save(entity);
  }

  async findAll(): Promise<RecurringTransaction[]> {
    return this.recurringRepo.find();
  }

  async findOne(id: number): Promise<RecurringTransaction> {
    const entity = await this.recurringRepo.findOne({
      where: { recurringTransactionId: id }
    });
    if (!entity) throw new NotFoundException('RecurringTransaction not found');
    return entity;
  }

  async update(
    userId: number,
    id: number,
    dto: UpdateRecurringTransactionDto
  ): Promise<RecurringTransaction> {
    await this.findOne(id);
    await this.recurringRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(userId, id: number): Promise<void> {
    await this.findOne(id);
    await this.recurringRepo.delete(id);
  }
}
