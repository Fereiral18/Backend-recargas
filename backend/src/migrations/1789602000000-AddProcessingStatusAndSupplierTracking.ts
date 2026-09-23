import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProcessingStatusAndSupplierTracking1789602000000 implements MigrationInterface {
    name = 'AddProcessingStatusAndSupplierTracking1789602000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Postgres can't ALTER TYPE ... ADD VALUE and use it in the same
        // transaction on older versions, so recreate the enum type instead.
        await queryRunner.query(`ALTER TYPE "public"."recharges_status_enum" RENAME TO "recharges_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."recharges_status_enum" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED')`);
        await queryRunner.query(`ALTER TABLE "recharges" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "recharges" ALTER COLUMN "status" TYPE "public"."recharges_status_enum" USING "status"::text::"public"."recharges_status_enum"`);
        await queryRunner.query(`ALTER TABLE "recharges" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."recharges_status_enum_old"`);

        await queryRunner.query(`ALTER TABLE "recharges" ADD "supplier_order_id" character varying`);
        await queryRunner.query(`ALTER TABLE "recharges" ADD "supplier_response" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recharges" DROP COLUMN "supplier_response"`);
        await queryRunner.query(`ALTER TABLE "recharges" DROP COLUMN "supplier_order_id"`);

        await queryRunner.query(`ALTER TYPE "public"."recharges_status_enum" RENAME TO "recharges_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."recharges_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')`);
        await queryRunner.query(`ALTER TABLE "recharges" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "recharges" ALTER COLUMN "status" TYPE "public"."recharges_status_enum" USING "status"::text::"public"."recharges_status_enum"`);
        await queryRunner.query(`ALTER TABLE "recharges" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."recharges_status_enum_old"`);
    }

}
