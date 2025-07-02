import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
// base.entity.ts

import { BaseEntity } from '../../../common/base/base.entity';

@Entity()
export class FinancialGoals extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  goalId: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  goalName: string;

  @Column({ nullable: false })
  targetAmount: number;

  @Column({ nullable: false })
  deadline: string | Date;

  @Column({ default: true })
  autoDeduct: boolean;
}
