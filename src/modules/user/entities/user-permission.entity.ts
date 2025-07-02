import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
// base.entity.ts

import { BaseEntity } from '../../../common/base/base.entity';
import { EPermission } from '../dto/enum.dto';

@Entity()
export class UserPermission extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  userPermissionId: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  permission: EPermission;

  @Column({ nullable: false })
  userRole: string;

  @Column({ default: false })
  isHidden: boolean;
}
