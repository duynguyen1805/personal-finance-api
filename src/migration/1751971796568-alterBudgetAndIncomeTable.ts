import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterBudgetAndIncomeTable1751971796568
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "income"
            ADD COLUMN "date" date NOT NULL DEFAULT CURRENT_DATE,
            ADD COLUMN "year" integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer,
            ALTER COLUMN "month" TYPE integer USING EXTRACT(MONTH FROM "month"),
            ALTER COLUMN "month" SET DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)::integer
    `);
    await queryRunner.query(`
        ALTER TABLE "budgets"
            ADD COLUMN "date" date NOT NULL DEFAULT CURRENT_DATE,
            ADD COLUMN "year" integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer,
            ALTER COLUMN "month" TYPE integer USING EXTRACT(MONTH FROM "month"),
            ALTER COLUMN "month" SET DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)::integer
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "income"
            ALTER COLUMN "month" DROP DEFAULT,
            ALTER COLUMN "month" TYPE date,
            DROP COLUMN "year",
            DROP COLUMN "date"
    `);
    await queryRunner.query(`
        ALTER TABLE "budgets"
            ALTER COLUMN "month" DROP DEFAULT,
            ALTER COLUMN "month" TYPE date,
            DROP COLUMN "year",
            DROP COLUMN "date"
    `);
  }
}
