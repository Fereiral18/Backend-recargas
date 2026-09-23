import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRechargePackages1789604000000 implements MigrationInterface {
    name = 'AddRechargePackages1789604000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."recharge_packages_operator_enum" AS ENUM('FREE_FIRE', 'PUBG_MOBILE', 'MOBILE_LEGENDS', 'GENSHIN_IMPACT', 'COD_MOBILE', 'FORTNITE', 'ROBLOX', 'OTHER')`);
        await queryRunner.query(`CREATE TYPE "public"."recharge_packages_type_enum" AS ENUM('DIAMONDS', 'COINS', 'UC', 'CRYSTALS', 'BATTLE_PASS', 'BUNDLE', 'PB_CARD', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "recharge_packages" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "operator" "public"."recharge_packages_operator_enum" NOT NULL, "package" character varying NOT NULL, "type" "public"."recharge_packages_type_enum" NOT NULL, "name" character varying NOT NULL, "diamonds" integer, "b2c_price_ars" numeric(10,2) NOT NULL, "reseller_price_usd" numeric(10,2) NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_recharge_packages_operator_package" UNIQUE ("operator", "package"), CONSTRAINT "PK_recharge_packages_uuid" PRIMARY KEY ("uuid"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "recharge_packages"`);
        await queryRunner.query(`DROP TYPE "public"."recharge_packages_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."recharge_packages_operator_enum"`);
    }

}
