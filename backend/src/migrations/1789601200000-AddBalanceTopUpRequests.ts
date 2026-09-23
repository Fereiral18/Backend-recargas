import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBalanceTopUpRequests1789601200000 implements MigrationInterface {
    name = 'AddBalanceTopUpRequests1789601200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."balance_topup_requests_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "balance_topup_requests" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "amount" numeric(10,2) NOT NULL, "proof_image_path" character varying NOT NULL, "note" text, "status" "public"."balance_topup_requests_status_enum" NOT NULL DEFAULT 'PENDING', "reviewed_by" uuid, "review_note" text, "reviewed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_balance_topup_requests_uuid" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`ALTER TABLE "balance_topup_requests" ADD CONSTRAINT "FK_balance_topup_requests_user" FOREIGN KEY ("user_id") REFERENCES "users"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "balance_topup_requests" ADD CONSTRAINT "FK_balance_topup_requests_reviewer" FOREIGN KEY ("reviewed_by") REFERENCES "users"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "balance_topup_requests" DROP CONSTRAINT "FK_balance_topup_requests_reviewer"`);
        await queryRunner.query(`ALTER TABLE "balance_topup_requests" DROP CONSTRAINT "FK_balance_topup_requests_user"`);
        await queryRunner.query(`DROP TABLE "balance_topup_requests"`);
        await queryRunner.query(`DROP TYPE "public"."balance_topup_requests_status_enum"`);
    }

}
