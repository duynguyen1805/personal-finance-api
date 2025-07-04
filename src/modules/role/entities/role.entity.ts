import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { ERole } from '../dto/enum-role.dto';

@Entity()
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: ERole;

  @Column()
  permissions: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ nullable: true })
  description: string;
}
