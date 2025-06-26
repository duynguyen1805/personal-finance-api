import {MigrationInterface, QueryRunner} from "typeorm";

export class addUserPermissionAndAuthProviderTable1750948171841 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "user_permission" (
                "userPermissionId" SERIAL NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "userId" integer NOT NULL,
                "permission" character varying NOT NULL,
                "userRole" character varying NOT NULL,
                "isHidden" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_user_permission" PRIMARY KEY ("userPermissionId")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "user_auth_provider" (
                "userAuthProviderId" SERIAL NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "userId" integer NOT NULL,
                "authProvider" character varying NOT NULL,
                "authProviderId" character varying NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_user_auth_provider" PRIMARY KEY ("userAuthProviderId")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN "email" character varying NOT NULL,
            ADD COLUMN "passwordHash" character varying NOT NULL,
            ADD COLUMN "firstName" character varying NOT NULL,
            ADD COLUMN "lastName" character varying NOT NULL,
            ADD COLUMN "accountType" character varying NOT NULL,
            ADD COLUMN "lastChangePasswordAt" TIMESTAMP WITH TIME ZONE,
            ADD COLUMN "isFrozen" boolean NOT NULL DEFAULT false,
            ADD COLUMN "avatar" integer,
            ADD COLUMN "isTwoFactorAuthEnabled" boolean NOT NULL DEFAULT false,
            ADD COLUMN "twoFactorAuthSecret" character varying,
            ADD COLUMN "timeActiveTwoFactorAuth" TIMESTAMP WITH TIME ZONE
        `);

        await queryRunner.query(`
            CREATE TABLE "file" (
                "fileId" SERIAL NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "userUploadId" integer NOT NULL,
                "mineType" character varying NOT NULL,
                "fileExtension" character varying NOT NULL,
                "fileName" character varying NOT NULL,
                "url" character varying NOT NULL,
                "size" integer NOT NULL,
                "title" character varying NOT NULL,
                "content" character varying NOT NULL,
                "uploadHash" character varying NOT NULL,
                "priorityStorage" character varying NOT NULL
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user_auth_provider"`);
        await queryRunner.query(`DROP TABLE "user_permission"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "passwordHash"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "accountType"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastChangePasswordAt"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isFrozen"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isTwoFactorAuthEnabled"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twoFactorAuthSecret"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "timeActiveTwoFactorAuth"`);
        await queryRunner.query(`DROP TABLE "file"`);
    }

}
