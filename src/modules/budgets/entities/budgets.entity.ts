import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
// base.entity.ts

import { BaseEntity } from '../../../common/base.entity';

@Entity()
export class Budgets extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  budgetId: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  month: string | Date;

  @Column({ nullable: false })
  totalAmount: number;
}
