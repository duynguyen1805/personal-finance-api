import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
// base.entity.ts

import { BaseEntity } from '../../../common/base/base.entity';

// expenses: số tiền đã chi của 1 categori nào đó trong tháng

@Entity()
export class Expenses extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  expenseId: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  categoryId: number;

  @Column({ nullable: false })
  amount: number;

  @Column({ nullable: false })
  expenseDate: Date;
}
