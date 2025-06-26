import {MigrationInterface, QueryRunner} from "typeorm";

export class initPhase2PersonalFinance1750770720931 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
           CREATE TABLE "budgets" (
                "budgetId" SERIAL NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "userId" integer NOT NULL,
                "month" date NOT NULL,
                "totalAmount" numeric NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_budgets_budgetId" PRIMARY KEY ("budgetId"))
        `);

        await queryRunner.query(`
            CREATE TYPE category_type_enum AS ENUM ('ESSENTIAL_NEED', 'PERSONAL_WANTS', 'SAVING_AND_INVESTMENT', 'FAMILY_AND_GIVING', 'OTHER')
        `);

        await queryRunner.query(`
            CREATE TABLE "categories" (
                "categoryId" SERIAL NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "budgetId" integer NOT NULL,
                "cateroryName" character varying NOT NULL,
                "typeCategory" category_type_enum NOT NULL DEFAULT 'OTHER',
                "allocatedAmount" numeric NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_categories_categoryId" PRIMARY KEY ("categoryId"),
                CONSTRAINT "FK_categories_budgetId" FOREIGN KEY ("budgetId") REFERENCES "budgets" ("budgetId") ON DELETE NO ACTION ON UPDATE NO ACTION)
        `)

        await queryRunner.query(`
            CREATE TABLE "expenses" (
                "expenseId" SERIAL NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "userId" integer NOT NULL,
                "categoryId" integer NOT NULL,
                "amount" numeric NOT NULL,
                "expenseDate" date NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_expenses_expenseId" PRIMARY KEY ("expenseId"),
                CONSTRAINT "FK_expenses_categoryId" FOREIGN KEY ("categoryId") REFERENCES "categories" ("categoryId") ON DELETE NO ACTION ON UPDATE NO ACTION)
        `)

        await queryRunner.query(`
            CREATE TABLE "financial_goals" (
                "goalId" SERIAL NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "userId" integer NOT NULL,
                "goalName" character varying NOT NULL,
                "targetAmount" numeric NOT NULL,
                "deadline" date NOT NULL,
                "autoDeduct" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_financial_goals_goalId" PRIMARY KEY ("goalId"))
        `)

        await queryRunner.query(`
            CREATE TABLE "register_verification" (
                "userId" integer NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "code" character varying NOT NULL,
                "isVerified" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "deleted_at" TIMESTAMP)    
        `)

        await queryRunner.query(`
            CREATE TABLE "otp" (
                "otpId" integer NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "userId" integer NOT NULL,
                "code" character varying NOT NULL,
                "action" character varying NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "deleted_at" TIMESTAMP)    
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "financial_goals"`);
        await queryRunner.query(`DROP TABLE "expenses"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "budgets"`);
        await queryRunner.query(`DROP TYPE category_type_enum`);
        await queryRunner.query(`DROP TABLE "register_verification"`);
        await queryRunner.query(`DROP TABLE "otp"`);
    }

}
