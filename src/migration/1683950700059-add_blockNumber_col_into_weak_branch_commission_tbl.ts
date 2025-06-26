import {MigrationInterface, QueryRunner} from "typeorm";

export class addBlockNumberColIntoWeakBranchCommissionTbl1683950700059 implements MigrationInterface {
    name = 'addBlockNumberColIntoWeakBranchCommissionTbl1683950700059'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "affiliate" ALTER COLUMN "income" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "affiliate" ALTER COLUMN "income" SET NOT NULL`);
    }

}
