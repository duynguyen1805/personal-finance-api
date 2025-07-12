import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDescriptionAndUpdateBudgetTable1752340110387
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "income" ADD "description" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" ADD "description" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "financial_goals" ADD "description" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "budgets"
        ADD "budgetName" character varying,
        ADD "period" character varying,
        ADD "startDate" date,
        ADD "endDate" date`
    );
    await queryRunner.query(
      `ALTER TABLE "categories"
        ADD "categoryIcon" character varying,
        ADD "categoryColor" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" DROP COLUMN "categoryColor"`
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP COLUMN "categoryIcon"`
    );
    await queryRunner.query(`ALTER TABLE "budgets" DROP COLUMN "endDate"`);
    await queryRunner.query(`ALTER TABLE "budgets" DROP COLUMN "startDate"`);
    await queryRunner.query(`ALTER TABLE "budgets" DROP COLUMN "period"`);
    await queryRunner.query(`ALTER TABLE "budgets" DROP COLUMN "budgetName"`);
    await queryRunner.query(
      `ALTER TABLE "financial_goals" DROP COLUMN "description"`
    );
    await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "income" DROP COLUMN "description"`);
  }
}
