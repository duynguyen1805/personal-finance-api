import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNotificationTable1753754066821 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create notification_type enum
    await queryRunner.query(`
      CREATE TYPE notification_type_enum AS ENUM ('EMAIL', 'PUSH', 'IN_APP')
    `);

    // Create notification_status enum
    await queryRunner.query(`
      CREATE TYPE notification_status_enum AS ENUM ('PENDING', 'SENT', 'FAILED', 'READ')
    `);

    // Create notifications table
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "notificationId" SERIAL NOT NULL,
        "userId" integer NOT NULL,
        "title" character varying NOT NULL,
        "message" text NOT NULL,
        "type" notification_type_enum NOT NULL DEFAULT 'IN_APP',
        "status" notification_status_enum NOT NULL DEFAULT 'PENDING',
        "relatedEntityId" integer,
        "relatedEntityType" character varying,
        "scheduledAt" TIMESTAMP,
        "sentAt" TIMESTAMP,
        "readAt" TIMESTAMP,
        "metadata" json,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
        CONSTRAINT "PK_notifications_notificationId" PRIMARY KEY ("notificationId")
      )
    `);

    // Add indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_userId" ON "notifications" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_status" ON "notifications" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_scheduledAt" ON "notifications" ("scheduledAt")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_createdAt" ON "notifications" ("created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_notifications_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_scheduledAt"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_status"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_userId"`);

    // Drop notifications table
    await queryRunner.query(`DROP TABLE "notifications"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE notification_status_enum`);
    await queryRunner.query(`DROP TYPE notification_type_enum`);
  }
}
