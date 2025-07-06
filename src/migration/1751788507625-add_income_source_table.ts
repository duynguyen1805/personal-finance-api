import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIncomeSourceTable1751788507625 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
           CREATE TABLE "income" (
                "incomeId" SERIAL NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "userId" integer NOT NULL,
                "month" date NOT NULL,
                "amount" numeric NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_income_incomeId" PRIMARY KEY ("incomeId"))
        `);

    await queryRunner.query(`
            ALTER TABLE "register_verification"
            ADD CONSTRAINT "PK_register_verification_code" PRIMARY KEY ("code")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "income"`);
  }
}
