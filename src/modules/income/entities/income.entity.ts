import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
// base.entity.ts

import { BaseEntity } from '../../../common/base/base.entity';
import { EIncomeTypeSourceName } from '../enums/income.enum';

// income: số tiền đầu vào

@Entity()
export class Income extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  incomeId: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  sourceName: EIncomeTypeSourceName;

  @Column({ nullable: true })
  customName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: false })
  date: Date;

  @Column({ nullable: false })
  month: number;

  @Column({ nullable: false })
  year: number;

  @Column({ nullable: false })
  amount: number;
}
