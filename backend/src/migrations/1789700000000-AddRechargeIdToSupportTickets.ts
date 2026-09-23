import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRechargeIdToSupportTickets1789700000000 implements MigrationInterface {
    name = 'AddRechargeIdToSupportTickets1789700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "support_tickets" ADD "recharge_id" uuid`);
        await queryRunner.query(`ALTER TABLE "support_tickets" ADD CONSTRAINT "FK_support_tickets_recharge_id" FOREIGN KEY ("recharge_id") REFERENCES "recharges"("uuid") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "support_tickets" DROP CONSTRAINT "FK_support_tickets_recharge_id"`);
        await queryRunner.query(`ALTER TABLE "support_tickets" DROP COLUMN "recharge_id"`);
    }

}
