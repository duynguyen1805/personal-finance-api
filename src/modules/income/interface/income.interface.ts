import { Income } from '../entities/income.entity';

export interface IIncomeCreateOutput {
  income: Income;
  totalIncome: number;
}

export interface IIncomeUpdateOutput extends IIncomeCreateOutput {}
export interface IIncomeGetAllOutput {
  incomes: Income[];
  totalIncome: number;
}
