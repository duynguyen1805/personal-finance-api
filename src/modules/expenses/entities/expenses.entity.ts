import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
// base.entity.ts

import { BaseEntity } from '../../../common/base.entity';

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
  expenseDate: string | Date;
}
