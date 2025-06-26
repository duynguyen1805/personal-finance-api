import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity()
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;
  
  @Column()
  name: string;

  @Column()
  permissions: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ nullable: true })
  description: string;
}
