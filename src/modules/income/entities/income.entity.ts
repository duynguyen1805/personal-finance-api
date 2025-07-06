import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
// base.entity.ts

import { BaseEntity } from '../../../common/base/base.entity';

// income: số tiền đầu vào

@Entity()
export class Income extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  incomeId: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  sourceName: string;

  @Column({ nullable: false })
  month: Date;

  @Column({ nullable: false })
  amount: number;
}
