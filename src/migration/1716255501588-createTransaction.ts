import {MigrationInterface, QueryRunner} from "typeorm";

export class addTableTransaction1716255501588 implements MigrationInterface {
    name = 'addTableTransaction1716255501588'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, "transactionHash" character varying, "amount" integer NOT NULL DEFAULT '0', "balanceBefore" integer NOT NULL DEFAULT '0', "balanceAfter" integer NOT NULL DEFAULT '0', "comment" character varying NOT NULL, "coin" character varying NOT NULL DEFAULT 'DEMO', "status" character varying NOT NULL DEFAULT 'PENDING', CONSTRAINT "UQ_transactions_transactionHash" UNIQUE ("transactionHash"), CONSTRAINT "UQ_transactions" UNIQUE ("comment"), CONSTRAINT "PK_transactions" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "transactions"`);
    }
}
