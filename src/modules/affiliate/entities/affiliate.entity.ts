import { Column, Entity, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { EnumAffDirect, EnumAffRank } from '../dto/enum.dto';

@Entity()
@Tree('closure-table', {
  closureTableName: 'affiliate',
  ancestorColumnName: (column) => 'ancestor_' + column.propertyName,
  descendantColumnName: (column) => 'descendant_' + column.propertyName
})
export class Affiliate extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

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

  @TreeParent()
  parent: Affiliate;

  @TreeChildren()
  children: Affiliate[];
}

export interface Package {
  pkgAmount: number;
  buyPkgFee: number;
}
