import {MigrationInterface, QueryRunner} from "typeorm";

export class addLevelColIntoAffTbl1683120771342 implements MigrationInterface {
    name = 'addLevelColIntoAffTbl1683120771342'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "affiliate" ADD "level" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "affiliate" DROP COLUMN "level"`);
    }

}
