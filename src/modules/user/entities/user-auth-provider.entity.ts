import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
// base.entity.ts

import { BaseEntity } from '../../../common/base/base.entity';
import { EAuthProvider, EPermission } from '../dto/enum.dto';
import { User } from './user.entity';

@Entity()
export class UserAuthProvider extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  userAuthProviderId: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  permission: EPermission;

  @Column({ nullable: false })
  authProvider: EAuthProvider;

  @Column({ nullable: false })
  authProviderId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
