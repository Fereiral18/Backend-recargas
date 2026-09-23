import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRechargeIdToTransactions1789710000000 implements MigrationInterface {
    name = 'AddRechargeIdToTransactions1789710000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "recharge_id" uuid`);

        // Backfill: hasta ahora el vínculo con la recarga solo vivía suelto
        // dentro de metadata.recharge_uuid (ver RechargesService), sin
        // relación real. Lo recuperamos de ahí para las filas existentes.
        await queryRunner.query(`
            UPDATE "transactions"
            SET "recharge_id" = (metadata->>'recharge_uuid')::uuid
            WHERE metadata->>'recharge_uuid' IS NOT NULL
        `);

        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_recharge_id" FOREIGN KEY ("recharge_id") REFERENCES "recharges"("uuid") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_recharge_id"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "recharge_id"`);
    }

}
