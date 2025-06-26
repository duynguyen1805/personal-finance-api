import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
// base.entity.ts

import { ESendOTPAction } from '../dto/enum.dto';
import { BaseEntity } from '../../../common/base.entity';

@Entity()
export class Otp extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  otpId: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  code: string;

  @Column({ nullable: false })
  action: ESendOTPAction;
}
