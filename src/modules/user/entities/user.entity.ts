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
  @JoinTable({
    name: 'user_roles_role', // <== tên bảng trung gian
    joinColumn: {
      name: 'userId', // <== tên bạn muốn đặt trong bảng trung gian
      referencedColumnName: 'id' // <== cột thực tế trong bảng user
    },
    inverseJoinColumn: {
      name: 'roleId', // <== tên cột trong bảng trung gian
      referencedColumnName: 'id' // <== cột thực tế trong bảng role
    }
  })
  roles: Role[];

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  passwordHash: string;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: false, default: '' })
  accountType: string;

  @Column({ nullable: true })
  lastChangePasswordAt: Date;

  @Column({ default: false })
  isFrozen: boolean;

  @Column({ nullable: true })
  avatar: number;

  @Column({ default: false })
  isTwoFactorAuthEnabled: boolean;

  @Column({ nullable: true })
  twoFactorAuthSecret: string;

  @Column({ nullable: true })
  timeActiveTwoFactorAuth: Date;
}
