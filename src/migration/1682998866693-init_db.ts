import {MigrationInterface, QueryRunner} from "typeorm";

export class initDb1682998866693 implements MigrationInterface {
    name = 'initDb1682998866693'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "affiliate" ("id" SERIAL NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, "address" character varying NOT NULL, "income" numeric NOT NULL DEFAULT '0', "avatar" character varying, "refAddress" character varying, "direction" integer, "position" integer NOT NULL, "parentId" integer, CONSTRAINT "PK_affiliate" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role" ("id" SERIAL NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "permissions" character varying NOT NULL, "isDefault" boolean NOT NULL DEFAULT false, "description" character varying, CONSTRAINT "PK_role" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, "walletAddress" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'ACTIVE', CONSTRAINT "UQ_user" UNIQUE ("walletAddress"), CONSTRAINT "PK_user" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_roles_role" ("userId" integer NOT NULL, "roleId" integer NOT NULL, CONSTRAINT "PK_user_roles_role" PRIMARY KEY ("userId", "roleId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_user_roles_role_user" ON "user_roles_role" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_user_roles_role_role" ON "user_roles_role" ("roleId") `);
        await queryRunner.query(`CREATE TABLE "affiliate_closure" ("ancestor_id" integer NOT NULL, "descendant_id" integer NOT NULL, CONSTRAINT "PK_affiliate_closure" PRIMARY KEY ("ancestor_id", "descendant_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_affiliate_closure_ancestor" ON "affiliate_closure" ("ancestor_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_affiliate_closure_descendant" ON "affiliate_closure" ("descendant_id") `);
        await queryRunner.query(`ALTER TABLE "affiliate" ADD CONSTRAINT "FK_affiliate_parent" FOREIGN KEY ("parentId") REFERENCES "affiliate"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles_role" ADD CONSTRAINT "FK_user_roles_role_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_roles_role" ADD CONSTRAINT "FK_user_roles_role_role" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "affiliate_closure" ADD CONSTRAINT "FK_affiliate_closure_ancestor" FOREIGN KEY ("ancestor_id") REFERENCES "affiliate"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "affiliate_closure" ADD CONSTRAINT "FK_affiliate_closure_descendant" FOREIGN KEY ("descendant_id") REFERENCES "affiliate"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "affiliate_closure" DROP CONSTRAINT "FK_affiliate_closure_descendant"`);
        await queryRunner.query(`ALTER TABLE "affiliate_closure" DROP CONSTRAINT "FK_affiliate_closure_ancestor"`);
        await queryRunner.query(`ALTER TABLE "user_roles_role" DROP CONSTRAINT "FK_user_roles_role_role"`);
        await queryRunner.query(`ALTER TABLE "user_roles_role" DROP CONSTRAINT "FK_user_roles_role_user"`);
        await queryRunner.query(`ALTER TABLE "affiliate" DROP CONSTRAINT "FK_affiliate_parent"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_affiliate_closure_descendant"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_affiliate_closure_ancestor"`);
        await queryRunner.query(`DROP TABLE "affiliate_closure"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_roles_role_role"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_roles_role_user"`);
        await queryRunner.query(`DROP TABLE "user_roles_role"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP TABLE "affiliate"`);
    }

}
