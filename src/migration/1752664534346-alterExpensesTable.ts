import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterExpensesTable1752664534346 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // drop old foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_categoryId"
    `);

    // rename column
    await queryRunner.query(`
      ALTER TABLE "expenses" RENAME COLUMN "categoryId" TO "budgetId"
    `);

    // add new foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "expenses"
      ADD CONSTRAINT "FK_expenses_budgetId"
      FOREIGN KEY ("budgetId") REFERENCES "budgets" ("budgetId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "budgets" ADD "spent" integer
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_budgetId"
    `);

    await queryRunner.query(`
      ALTER TABLE "expenses" RENAME COLUMN "budgetId" TO "categoryId"
    `);

    await queryRunner.query(`
      ALTER TABLE "expenses"
      ADD CONSTRAINT "FK_expenses_categoryId"
      FOREIGN KEY ("categoryId") REFERENCES "categories" ("categoryId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "budgets" DROP COLUMN "spent"
    `);
  }
}
