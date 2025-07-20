import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Income } from '../income/entities/income.entity';
import { Expenses } from '../expenses/entities/expenses.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Income)
    private readonly incomeRepo: Repository<Income>,
    @InjectRepository(Expenses)
    private readonly expensesRepo: Repository<Expenses>
  ) {}

  async getDashboardData(userId: number) {
    // console.log('userId', userId);
    // Tổng thu nhập
    const totalIncome = await this.incomeRepo
      .createQueryBuilder('income')
      .select('SUM(income.amount)', 'sum')
      .where('income.userId = :userId', { userId })
      .getRawOne();

    // console.log('totalIncome', totalIncome);
    // Tổng chi tiêu
    const totalExpenses = await this.expensesRepo
      .createQueryBuilder('expenses')
      .select('SUM(expenses.amount)', 'sum')
      .where('expenses.userId = :userId', { userId })
      .getRawOne();
    // console.log('totalExpenses', totalExpenses);

    // Lấy tháng hiện tại
    const now = new Date();
    const month = Number(now.getMonth() + 1);
    const year = Number(now.getFullYear());
    if (!Number.isFinite(month) || !Number.isFinite(year)) {
      throw new Error('Invalid month or year');
    }
    // Log giá trị tháng/năm để debug
    // console.log('DashboardService month:', month, 'year:', year);

    // Thu nhập tháng
    const monthlyIncomeRaw = await this.incomeRepo
      .createQueryBuilder('income')
      .select('SUM(income.amount)', 'sum')
      .where('income.userId = :userId', { userId })
      .andWhere('EXTRACT(MONTH FROM income.date) = :month', { month })
      .andWhere('EXTRACT(YEAR FROM income.date) = :year', { year })
      .getRawOne();
    const monthlyIncome = Number(monthlyIncomeRaw?.sum);
    // Chi tiêu tháng
    const monthlyExpensesRaw = await this.expensesRepo
      .createQueryBuilder('expenses')
      .select('SUM(expenses.amount)', 'sum')
      .where('expenses.userId = :userId', { userId })
      .andWhere('EXTRACT(MONTH FROM expenses.expenseDate) = :month', { month })
      .andWhere('EXTRACT(YEAR FROM expenses.expenseDate) = :year', { year })
      .getRawOne();
    const monthlyExpenses = Number(monthlyExpensesRaw?.sum);
    // console.log('monthlyIncome', monthlyIncome);
    // console.log('monthlyExpenses', monthlyExpenses);

    // Top categories (chi nhiều nhất, group theo category, lấy top 5)
    const topCategories = await this.expensesRepo
      .createQueryBuilder('expenses')
      .leftJoinAndSelect('expenses.budgets', 'budgets')
      .leftJoinAndSelect('budgets.category', 'category')
      .select('category.categoryId', 'id')
      .addSelect('category.categoryName', 'name')
      .addSelect('category.typeCategory', 'type')
      .addSelect('category.categoryColor', 'color')
      .addSelect('category.categoryIcon', 'icon')
      .addSelect('category.userId', 'userId')
      .addSelect('category.createdAt', 'createdAt')
      .addSelect('category.updatedAt', 'updatedAt')
      .addSelect('SUM(expenses.amount)', 'amount')
      .where('expenses.userId = :userId', { userId })
      .groupBy('category.categoryId')
      .orderBy('amount', 'DESC')
      .limit(5)
      .getRawMany();
    // console.log('topCategories', topCategories);

    // Recent transactions (chi tiêu gần nhất, join category)
    const recentTransactions = await this.expensesRepo
      .createQueryBuilder('expenses')
      .leftJoinAndSelect('expenses.budgets', 'budgets')
      .leftJoinAndSelect('budgets.category', 'category')
      .select([
        'expenses.expenseId AS id',
        'expenses.amount AS amount',
        'expenses.description AS description',
        'category.categoryId AS categoryId',
        'category.categoryName AS categoryName',
        'category.typeCategory AS type',
        'category.categoryColor AS color',
        'category.categoryIcon AS icon',
        'category.userId AS userId',
        'category.createdAt AS createdAt',
        'category.updatedAt AS updatedAt',
        'expenses.expenseDate AS date',
        'expenses.userId AS userId',
        'expenses.createdAt AS createdAt',
        'expenses.updatedAt AS updatedAt'
      ])
      .where('expenses.userId = :userId', { userId })
      .orderBy('expenses.expenseDate', 'DESC')
      .limit(5)
      .getRawMany();
    // console.log('recentTransactions', recentTransactions);

    return {
      totalIncome: Number(totalIncome?.sum) || 0,
      totalExpenses: Number(totalExpenses?.sum) || 0,
      balance:
        (Number(totalIncome?.sum) || 0) - (Number(totalExpenses?.sum) || 0),
      monthlyIncome: Number.isFinite(monthlyIncome) ? monthlyIncome : 0,
      monthlyExpenses: Number.isFinite(monthlyExpenses) ? monthlyExpenses : 0,
      monthlyBalance:
        (Number.isFinite(monthlyIncome) ? monthlyIncome : 0) -
        (Number.isFinite(monthlyExpenses) ? monthlyExpenses : 0),
      topCategories: topCategories.map((cat) => ({
        category: {
          categoryId: String(cat.id),
          categoryName: cat.name,
          typeCategory: cat.type,
          categoryColor: cat.color,
          categoryIcon: cat.icon,
          userId: String(cat.userId),
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt
        },
        amount: Number(cat.amount) || 0
      })),
      recentTransactions: recentTransactions.map((tx) => ({
        expenseId: String(tx.id),
        amount: -Math.abs(Number(tx.amount) || 0), // chi tiêu là số âm
        description: tx.description,
        categoryId: String(tx.categoryId),
        category: {
          categoryId: String(tx.categoryId),
          categoryName: tx.categoryName,
          typeCategory: tx.type,
          categoryColor: tx.color,
          categoryIcon: tx.icon,
          userId: String(tx.userId),
          createdAt: tx.createdAt,
          updatedAt: tx.updatedAt
        },
        date: tx.date,
        userId: String(tx.userId),
        createdAt: tx.createdAt,
        updatedAt: tx.updatedAt
      }))
    };
  }
}
