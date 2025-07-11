import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Categories } from '../../categories/entities/categories.entity';
import { BaseEntity } from '../../../common/base/base.entity';

export enum RecurringType {
  EXPENSE = 'expense',
  INCOME = 'income'
}

export enum RecurringFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

@Entity('recurring_transaction')
export class RecurringTransaction extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  recurringTransactionId: number;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: false })
  amount: number;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Categories, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Categories;

  @Column({ type: 'enum', enum: RecurringType })
  recurringType: RecurringType;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'enum', enum: RecurringFrequency })
  frequency: RecurringFrequency;

  @Column({ type: 'date', nullable: true })
  lastExecuted: Date;
}
