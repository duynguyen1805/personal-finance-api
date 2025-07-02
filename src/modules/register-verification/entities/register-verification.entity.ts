import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
// base.entity.ts

import { BaseEntity } from '../../../common/base/base.entity';

@Entity()
export class RegisterVerification extends BaseEntity {
  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  code: string;

  @Column({ default: false })
  isVerified: boolean;
}
