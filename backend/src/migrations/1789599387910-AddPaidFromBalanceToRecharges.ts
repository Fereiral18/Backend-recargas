import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaidFromBalanceToRecharges1789599387910 implements MigrationInterface {
    name = 'AddPaidFromBalanceToRecharges1789599387910'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recharges" ADD "paid_from_balance" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recharges" DROP COLUMN "paid_from_balance"`);
    }

}
