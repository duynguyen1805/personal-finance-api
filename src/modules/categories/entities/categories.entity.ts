import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
// base.entity.ts

import { BaseEntity } from '../../../common/base/base.entity';
import { ECategoriesType } from '../enums/categories.enum';
import { Budgets } from '../../budgets/entities/budgets.entity';

// categories: danh sách danh mục, có các type default và OTHER, cho phép define theo categoryName

@Entity()
export class Categories extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  categoryId: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  categoryName: string;

  @Column({ nullable: false })
  typeCategory: ECategoriesType;

  @Column({ nullable: false })
  allocatedAmount: number;

  @Column({ nullable: true })
  categoryIcon: string;

  @Column({ nullable: true })
  categoryColor: string;

  @OneToMany(() => Budgets, (budget) => budget.category)
  budgets: Budgets[];
}
