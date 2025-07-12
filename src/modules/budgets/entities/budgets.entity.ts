import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
// base.entity.ts

import { BaseEntity } from '../../../common/base/base.entity';
import { Categories } from 'src/modules/categories/entities/categories.entity';

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

  @Column({ nullable: false })
  date: Date;

  @Column({ nullable: false })
  month: number;

  @Column({ nullable: false })
  year: number;

  @Column({ nullable: false })
  totalAmount: number;

  // @ManyToMany(() => Categories, (categories) => categories.budgetId)
  // @JoinTable()
  // categories: Categories[];

  @Column({ nullable: true })
  period: string;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;
}
