import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterBudgetsTable1752377690153 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm foreign key constraint cho budgets.categoryId -> categories.categoryId
    await queryRunner.query(
      `ALTER TABLE "budgets" 
       ADD CONSTRAINT "FK_budgets_categoryId" 
       FOREIGN KEY ("categoryId") REFERENCES "categories" ("categoryId") 
       ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "budgets" DROP CONSTRAINT "FK_budgets_categoryId"`
    );
  }
}
