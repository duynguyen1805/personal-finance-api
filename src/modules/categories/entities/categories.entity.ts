import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
// base.entity.ts

import { BaseEntity } from '../../../common/base.entity';
import { ECategoriesType } from '../dto/enum.dto';

@Entity()
export class Categories extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  categoryId: number;

  @Column({ nullable: false })
  budgetId: number;

  @Column({ nullable: false })
  cateroryName: string;

  @Column({ nullable: false })
  typeCategory: ECategoriesType;

  @Column({ nullable: false })
  allocatedAmount: number;
}
