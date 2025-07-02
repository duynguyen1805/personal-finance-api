import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
// base.entity.ts

import { EnumUserStatus } from '../dto/enum.dto';
import { BaseEntity } from '../../../common/base/base.entity';
import { Role } from '../../role/entities/role.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true, nullable: true })
  walletAddress: string;

  @Column({ default: EnumUserStatus.ACTIVE })
  status: EnumUserStatus;

  @ManyToMany(() => Role)
  @JoinTable()
  roles: Role[];

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  paaswordHash: string;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: false, default: '' })
  accountType: string;

  @Column({ nullable: true })
  lastChangePasswordAt: string | Date;

  @Column({ default: false })
  isFrozen: boolean;

  @Column({ nullable: true })
  avatar: number;

  @Column({ default: false })
  isTwoFactorAuthEnabled: boolean;

  @Column({ nullable: true })
  twoFactorAuthSecret: string;

  @Column({ nullable: true })
  timeActiveTwoFactorAuth: string | Date;
}
