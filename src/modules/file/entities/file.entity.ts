import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
// base.entity.ts

import { BaseEntity } from '../../../common/base.entity';

@Entity()
export class File extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  fileId: number;

  @Column({ nullable: false })
  userUploadId: number;

  @Column({ nullable: false })
  mineType: string;

  @Column({ nullable: false })
  fileExtension: string;

  @Column({ nullable: false })
  fileName: string;

  @Column({ nullable: false })
  url: string;

  @Column({ nullable: false })
  size: number;

  @Column({ nullable: false, default: '' })
  title: string;

  @Column({ nullable: false, default: '' })
  content: string;

  @Column({ nullable: false, default: '' })
  uploadHash: string;

  @Column({ nullable: false, default: '' })
  priorityStorage: string;
}
