import { Brackets, MigrationInterface, QueryRunner } from 'typeorm';

export class Baseline1786327254363 implements MigrationInterface {
  name = 'Baseline1786327254363';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // La base de datos ya contiene el esquema actual.
    // Esta migración únicamente establece el baseline.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No hacemos rollback del esquema existente.
  }
}