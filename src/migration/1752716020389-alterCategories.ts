import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterCategories1752716020389 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE categories
      RENAME COLUMN "cateroryName" TO "categoryName";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
