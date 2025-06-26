import {MigrationInterface, QueryRunner} from "typeorm";

export class addCommissionTbl1683428723657 implements MigrationInterface {
    name = 'addCommissionTbl1683428723657'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "commission" ("id" SERIAL NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, "address" character varying NOT NULL, "amount" numeric NOT NULL DEFAULT '0', "type" character varying, "percent" numeric NOT NULL DEFAULT '0', "f0Commission" numeric NOT NULL DEFAULT '0', CONSTRAINT "PK_commission" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "commission"`);
    }

}
