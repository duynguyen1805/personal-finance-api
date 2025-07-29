import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { FinancialGoals } from './entities/financial-goals.entity';
import { CreateFinancialGoalDto } from './dto/create-financial-goal.dto';
import { UpdateFinancialGoalDto } from './dto/update-financial-goal.dto';

@Injectable()
export class FinancialGoalsService {
  constructor(
    @InjectRepository(FinancialGoals)
    private readonly goalsRepository: Repository<FinancialGoals>
  ) {}

  async createGoal(userId: number, dto: CreateFinancialGoalDto) {
    const entity = this.goalsRepository.create({ ...dto, userId });
    const data = await this.goalsRepository.save(entity);
    return { data, message: 'Financial goal created successfully', statusCode: 201 };
  }

  async updateGoal(userId: number, goalId: number, dto: UpdateFinancialGoalDto) {
    await this.getGoalById(userId, goalId);
    await this.goalsRepository.update({ userId, goalId }, dto);
    const data = await this.getGoalById(userId, goalId);
    return { data, message: 'Financial goal updated successfully', statusCode: 200 };
  }

  async getAllGoals(userId: number) {
    const data = await this.goalsRepository.find({ 
      where: { userId },
      order: { createdAt: 'DESC' }
    });
    return { data, message: 'Financial goals fetched successfully', statusCode: 200 };
  }

  async getGoalById(userId: number, goalId: number) {
    const data = await this.goalsRepository.findOne({ where: { userId, goalId } });
    if (!data) throw new NotFoundException('Financial goal not found');
    return data;
  }

  async deleteGoal(userId: number, goalId: number) {
    await this.getGoalById(userId, goalId);
    await this.goalsRepository.delete({ userId, goalId });
    return { data: null, message: 'Financial goal deleted successfully', statusCode: 200 };
  }

  async getGoalsByDeadlineRange(userId: number, startDate: Date, endDate: Date) {
    const data = await this.goalsRepository.find({
      where: {
        userId,
        deadline: Between(startDate, endDate)
      },
      order: { deadline: 'ASC' }
    });
    return data;
  }

  async getUpcomingDeadlines(userId: number, days: number = 30) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    return await this.getGoalsByDeadlineRange(userId, startDate, endDate);
  }
}
