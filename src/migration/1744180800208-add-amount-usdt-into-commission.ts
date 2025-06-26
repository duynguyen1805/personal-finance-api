import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAmountUsdtIntoCommission1744180800208
  implements MigrationInterface
{
  name = 'addAmountUsdtIntoCommission1744180800208';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "commission" ADD "amountUsdt" numeric NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "commission" ADD "exchangeRate" numeric NOT NULL DEFAULT '0'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "commission" DROP COLUMN "exchangeRate"`
    );
    await queryRunner.query(
      `ALTER TABLE "commission" DROP COLUMN "amountUsdt"`
    );
  }
}
