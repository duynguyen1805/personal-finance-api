import { MigrationInterface, QueryRunner } from 'typeorm';

export class updatePositionType1844690582000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "affiliate" ALTER COLUMN "position" TYPE text`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "affiliate" ALTER COLUMN "position" TYPE text`
    );
  }
}
