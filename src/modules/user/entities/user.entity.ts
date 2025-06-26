import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
// base.entity.ts

import { EnumUserStatus } from '../dto/enum.dto';
import { BaseEntity } from '../../../common/base.entity';
import { Role } from '../../role/entities/role.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  walletAddress: string;

  @Column({ default: EnumUserStatus.ACTIVE })
  status: EnumUserStatus;

  @ManyToMany(() => Role)
  @JoinTable()
  roles: Role[];

  @Column('numeric', { default: 0 })
  currentMaxoutLimit: number; // limit maxout hiện tại (300% của gói đầu tư) tính bằng USD

  @Column({ default: false })
  isMaxedOut: boolean;
}
