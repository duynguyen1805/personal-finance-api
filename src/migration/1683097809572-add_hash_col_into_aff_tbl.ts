import {MigrationInterface, QueryRunner} from "typeorm";

export class addHashColIntoAffTbl1683097809572 implements MigrationInterface {
    name = 'addHashColIntoAffTbl1683097809572'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "affiliate" ADD "hash" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "affiliate" DROP COLUMN "hash"`);
    }

}
