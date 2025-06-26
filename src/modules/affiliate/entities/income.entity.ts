import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity()
export class Income extends BaseEntity {
  @Column()
  member: string;

  @Column()
  binarySponsor: string;

  @Column()
  blockNumber: number;

  @Column()
  blockTimestamp: Date;

  @Column()
  transactionHash: string;

  @Column()
  type: string;

  @Column()
  packageAmount: string;
}
