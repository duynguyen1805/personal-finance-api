import {MigrationInterface, QueryRunner} from "typeorm";

export class addWalletAddressTransaction1716257771822 implements MigrationInterface {
    name = 'addWalletAddressTransaction1716257771822'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "walletAddress" character varying`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "UQ_transactions_transactionHash"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "transactionHash"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "transactionHash" character varying`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "UQ_transactions_transactionHash" UNIQUE ("transactionHash")`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "balanceBefore" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "balanceAfter" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "transactionType" character varying NOT NULL DEFAULT 'SYSTEM'`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "userId" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "balanceAfter" TYPE numeric(16,8)`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "balanceBefore" TYPE numeric(16,8)`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE numeric(16,8)`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "UQ_transactions_transactionHash"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "transactionHash"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "transactionHash" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "UQ_transactions_transactionHash" UNIQUE ("transactionHash")`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "walletAddress"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "transactionType"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "userId"`);
    }
}
