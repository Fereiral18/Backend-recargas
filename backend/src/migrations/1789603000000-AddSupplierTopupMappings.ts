import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSupplierTopupMappings1789603000000 implements MigrationInterface {
    name = 'AddSupplierTopupMappings1789603000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."supplier_topup_mappings_operator_enum" AS ENUM('FREE_FIRE', 'PUBG_MOBILE', 'MOBILE_LEGENDS', 'GENSHIN_IMPACT', 'COD_MOBILE', 'FORTNITE', 'ROBLOX', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "supplier_topup_mappings" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "operator" "public"."supplier_topup_mappings_operator_enum" NOT NULL, "package" character varying, "fzr_category_id" character varying NOT NULL, "fzr_offer_id" character varying NOT NULL, "fzr_player_id_field_key" character varying NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_supplier_topup_mappings_uuid" PRIMARY KEY ("uuid"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "supplier_topup_mappings"`);
        await queryRunner.query(`DROP TYPE "public"."supplier_topup_mappings_operator_enum"`);
    }

}
