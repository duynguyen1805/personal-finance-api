import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
// base.entity.ts

import { BaseEntity } from '../../../common/base/base.entity';
import { Categories } from '../../../modules/categories/entities/categories.entity';
import { Expenses } from '../../../modules/expenses/entities/expenses.entity';

// budget: số tiền dự kiến chi cho 1 khoảng nào đó (categories)

@Entity()
export class Budgets extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  budgetId: number;

  @Column({ nullable: true })
  budgetName: string;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  categoryId: number;

  @ManyToOne(() => Categories, (category) => category.budgets)
  @JoinColumn({ name: 'categoryId' })
  category: Categories;

  @Column({ nullable: false })
  date: Date;

  @Column({ nullable: false })
  month: number;

  @Column({ nullable: false })
  year: number;

  @Column({ nullable: false })
  totalAmount: number;

  @Column({ nullable: true })
  period: string;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @OneToMany(() => Expenses, (expense) => expense.budgets)
  expenses: Expenses[];
}
