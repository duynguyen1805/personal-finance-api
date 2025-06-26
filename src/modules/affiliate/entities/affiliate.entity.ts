import { Column, Entity, Tree, TreeChildren, TreeParent } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { EnumAffDirect, EnumAffRank } from '../dto/enum.dto';

@Entity()
@Tree('closure-table', {
  closureTableName: 'affiliate',
  ancestorColumnName: (column) => 'ancestor_' + column.propertyName,
  descendantColumnName: (column) => 'descendant_' + column.propertyName
})
export class Affiliate extends BaseEntity {
  @Column()
  address: string;

  @Column({ type: 'decimal', default: 0, nullable: true })
  income: number;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  refAddress: string;

  @Column({ nullable: true, enum: EnumAffDirect })
  direction: EnumAffDirect;

  @Column({ type: 'text' })
  position: string;

  @Column()
  level: number;

  @Column({ nullable: true })
  hash: string;

  @Column({ type: 'decimal', default: 0 })
  totalPkgAmount: number;

  @Column({ type: 'decimal', default: 0 })
  totalBuyPkgFee: number;

  @Column({ type: 'jsonb', nullable: true })
  packages: Package[];

  @TreeParent()
  parent: Affiliate;

  @TreeChildren()
  children: Affiliate[];

  @Column({
    type: 'enum',
    enum: EnumAffRank,
    default: EnumAffRank.NONE
  })
  @Column()
  rank?: EnumAffRank;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  totalVolume: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  weakBranchVolume: number;
}

export interface Package {
  pkgAmount: number;
  buyPkgFee: number;
}
