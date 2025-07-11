import { MigrationInterface, QueryRunner } from 'typeorm';

export class addRecurringTransactionTable1752224511205
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
           CREATE TABLE "recurring_transaction" (
                "recurringTransactionId" SERIAL NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "userId" integer NOT NULL,
                "amount" numeric NOT NULL,
                "categoryId" numeric NOT NULL,
                "recurringType" character varying NOT NULL,
                "description" character varying,
                "startDate" date,
                "endDate" date,
                "frequency" character varying NOT NULL,
                "lastExecuted" date,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_recurring_transaction_recurringTransactionId" PRIMARY KEY ("recurringTransactionId"))
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "recurring_transaction"`);
  }
}
