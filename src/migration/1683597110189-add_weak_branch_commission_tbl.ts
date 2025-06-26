import {MigrationInterface, QueryRunner} from "typeorm";

export class addWeakBranchCommissionTbl1683597110189 implements MigrationInterface {
    name = 'addWeakBranchCommissionTbl1683597110189'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "commission" ADD "note" text`);    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "commission" DROP COLUMN "note"`);
    }

}
