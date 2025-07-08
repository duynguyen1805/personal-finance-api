import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
// base.entity.ts

import { BaseEntity } from '../../../common/base/base.entity';

// budget: số tiền dự kiến chi cho 1 khoảng nào đó (categories)

@Entity()
export class Budgets extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  budgetId: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  date: Date;

  @Column({ nullable: false })
  month: number;

  @Column({ nullable: false })
  year: number;

  @Column({ nullable: false })
  totalAmount: number;
}
