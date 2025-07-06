import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
// base.entity.ts

import { BaseEntity } from '../../../common/base/base.entity';
import { Coin, TransactionStatus, TransactionType } from '../dto/enum.dto';
import { ColumnNumericTransformer } from '../../../common/helpers/common.helper';

@Entity()
export class Transactions extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: true })
  walletAddress: string;

  @Column({ unique: true, nullable: true })
  transactionHash: string;

  @Column('numeric', {
    default: 0,
    transformer: new ColumnNumericTransformer()
  })
  amount: number;

  @Column('numeric', {
    default: 0,
    transformer: new ColumnNumericTransformer()
  })
  balanceBefore: number;

  @Column('numeric', {
    default: 0,
    transformer: new ColumnNumericTransformer()
  })
  balanceAfter: number;

  @Column({ unique: true, nullable: false })
  comment: string;

  @Column({ default: Coin.DEMO })
  coin: Coin;

  @Column({ default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Column({ default: TransactionType.SYSTEM })
  transactionType: TransactionType;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: true })
  rewardUserId: number;

  @Column({ nullable: true })
  rewardType: string;
}
