import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
// base.entity.ts

import { BaseEntity } from '../../../common/base/base.entity';
import { Budgets } from '../../../modules/budgets/entities/budgets.entity';

// expenses: số tiền đã chi của 1 categori nào đó trong tháng

@Entity()
export class Expenses extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  expenseId: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  budgetId: number;

  @ManyToOne(() => Budgets, (budget) => budget.expenses)
  @JoinColumn({ name: 'budgetId' })
  budgets: Budgets;

  @Column({ nullable: false })
  amount: number;

  @Column({ nullable: false })
  expenseDate: Date;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  spent: number;
}
