import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUserNotificationPreferencesTable1753759901688
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_notification_preferences" (
        "id" SERIAL NOT NULL,
        "userId" integer NOT NULL,
        "email" boolean NOT NULL DEFAULT true,
        "push" boolean NOT NULL DEFAULT false,
        "budgetAlerts" boolean NOT NULL DEFAULT true,
        "goalReminders" boolean NOT NULL DEFAULT true,
        "expenseAlerts" boolean NOT NULL DEFAULT true,
        "incomeAlerts" boolean NOT NULL DEFAULT true,
        "weeklyReports" boolean NOT NULL DEFAULT true,
        "monthlyReports" boolean NOT NULL DEFAULT true,
        "achievementCelebrations" boolean NOT NULL DEFAULT true,
        "systemUpdates" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
        CONSTRAINT "PK_user_notification_preferences_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_notification_preferences_userId" ON "user_notification_preferences" ("userId")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_user_notification_preferences_userId_unique" ON "user_notification_preferences" ("userId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_user_notification_preferences_userId_unique"`
    );
    await queryRunner.query(
      `DROP INDEX "IDX_user_notification_preferences_userId"`
    );
    await queryRunner.query(`DROP TABLE "user_notification_preferences"`);
  }
}
