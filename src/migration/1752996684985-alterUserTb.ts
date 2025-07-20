import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterUserTb1752996684985 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user"
        ADD "theme" character varying(255) NOT NULL DEFAULT 'light',
        ADD "currency" character varying(255) NOT NULL DEFAULT 'VNĐ'   
    `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "theme"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "currency"`);
  }
}
