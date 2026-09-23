import { MigrationInterface, QueryRunner } from "typeorm";

export class AddResellerRoleAndModality1789598297540 implements MigrationInterface {
    name = 'AddResellerRoleAndModality1789598297540'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reseller_tiers" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "min_volume_usd" numeric(12,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_de4957fb8fa256a3b30dede5a7f" UNIQUE ("name"), CONSTRAINT "PK_e5d6d279291459bee6495eb2901" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`CREATE TYPE "public"."recharges_modality_enum" AS ENUM('DIRECT', 'GIFT_CARD')`);
        await queryRunner.query(`ALTER TABLE "recharges" ADD "modality" "public"."recharges_modality_enum" NOT NULL DEFAULT 'DIRECT'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "tier_id" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_550421549bb35c296d8f49fa6b9" FOREIGN KEY ("tier_id") REFERENCES "reseller_tiers"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_550421549bb35c296d8f49fa6b9"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tier_id"`);
        await queryRunner.query(`ALTER TABLE "recharges" DROP COLUMN "modality"`);
        await queryRunner.query(`DROP TYPE "public"."recharges_modality_enum"`);
        await queryRunner.query(`DROP TABLE "reseller_tiers"`);
    }

}
