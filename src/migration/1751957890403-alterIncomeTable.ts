import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterIncomeTable1751957890403 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "income" ADD COLUMN "customName" character varying DEFAULT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "income" DROP COLUMN "customName"`);
  }
}
