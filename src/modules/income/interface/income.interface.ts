import { Income } from '../entities/income.entity';

export interface IIncomeCreateOutput {
  incomes: Income;
  totalIncome: number;
}
