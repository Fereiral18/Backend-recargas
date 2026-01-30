import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { RechargeType, GameOperator } from '../src/common/enums';

describe('Recharges Flow (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userUuid: string;
  let rechargeUuid: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Register and login
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `recharge${Date.now()}@example.com`,
        phone: '+1234567890',
        firstName: 'Recharge',
        lastName: 'Test',
        password: 'password123',
      });

    authToken = registerResponse.body.data.access_token;
    userUuid = registerResponse.body.data.user.uuid;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Create Recharge', () => {
    it('should create a new recharge', async () => {
      const response = await request(app.getHttpServer())
        .post('/recharges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          user_id: userUuid,
          type: RechargeType.DIAMONDS,
          operator: GameOperator.FREE_FIRE,
          amount: 100,
          game_id: 'PLAYER123',
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('uuid');
      expect(response.body.data).toHaveProperty('reference');
      expect(response.body.data.fee).toBe(5);
      expect(response.body.data.total_amount).toBe(105);

      rechargeUuid = response.body.data.uuid;
    });

    it('should not create recharge without authentication', async () => {
      await request(app.getHttpServer())
        .post('/recharges')
        .send({
          user_id: userUuid,
          type: RechargeType.DIAMONDS,
          operator: GameOperator.FREE_FIRE,
          amount: 100,
          game_id: 'PLAYER123',
        })
        .expect(401);
    });
  });

  describe('Get Recharges', () => {
    it('should get all user recharges', async () => {
      const response = await request(app.getHttpServer())
        .get('/recharges')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should get recharge by uuid', async () => {
      const response = await request(app.getHttpServer())
        .get(`/recharges/${rechargeUuid}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.uuid).toBe(rechargeUuid);
    });

    it('should get recharge statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/recharges/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('completed');
      expect(response.body.data).toHaveProperty('pending');
    });
  });

  describe('Update Recharge', () => {
    it('should update recharge status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/recharges/${rechargeUuid}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'COMPLETED',
        })
        .expect(200);

      expect(response.body.data.status).toBe('COMPLETED');
    });
  });
});
