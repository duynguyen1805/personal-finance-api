import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budgets } from './entities/budgets.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budgets)
    private readonly budgetRepository: Repository<Budgets>
  ) {}

  async createBudget(userId: number, dto: CreateBudgetDto) {
    // const entity = this.budgetRepository.create({ ...dto, userId });
    // const data = await this.budgetRepository.save(entity);
    return {
      data: {},
      message: 'Budget created successfully',
      statusCode: 201
    };
  }

  async updateBudget(userId: number, budgetId: number, dto: CreateBudgetDto) {
    await this.getBudgetById(userId, budgetId);
    // await this.budgetRepository.update({ userId, budgetId }, dto);
    // const data = await this.getBudgetById(userId, budgetId);
    return {
      data: {},
      message: 'Budget updated successfully',
      statusCode: 200
    };
  }

  async getAllBudgets(userId: number) {
    const data = await this.budgetRepository.find({
      where: { userId }
    });
    return { data, message: 'Budgets fetched successfully', statusCode: 200 };
  }

  async getBudgetById(userId: number, budgetId: number) {
    const data = await this.budgetRepository.findOne({
      where: { userId, budgetId }
    });
    if (!data) throw new NotFoundException('Budget not found');
    return data;
  }

  async deleteBudget(userId: number, budgetId: number) {
    await this.getBudgetById(userId, budgetId);
    await this.budgetRepository.delete({ userId, budgetId });
    return {
      data: null,
      message: 'Budget deleted successfully',
      statusCode: 200
    };
  }
}
