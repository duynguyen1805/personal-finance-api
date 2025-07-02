import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { EnumAffRank } from '../dto/enum.dto';
import { COMMISSION_TYPES } from '../../transactions/dto/enum.dto';

@Entity()
export class Commission extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  address: string;

  @Column({ type: 'decimal', default: 0 })
  amount: number;

  @Column('numeric', { default: 0 })
  amountUsdt: number;

  @Column('numeric', { default: 0 })
  exchangeRate: number;

  @Column({ nullable: true })
  type: COMMISSION_TYPES;

  @Column({ type: 'decimal', default: 0 })
  percent: number;

  @Column({ type: 'decimal', default: 0 })
  f0Commission: number;

  @Column({ nullable: true })
  rank?: EnumAffRank;

  @Column({ type: 'text', nullable: true })
  note: string;
}
