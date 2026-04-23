import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransactionType } from '../src/common/enums';

describe('Transactions Flow (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userUuid: string;
  let transactionUuid: string;

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
        email: `transaction${Date.now()}@example.com`,
        phone: '+1234567890',
        firstName: 'Transaction',
        lastName: 'Test',
        password: 'password123',
      });

    authToken = registerResponse.body.data.access_token;
    userUuid = registerResponse.body.data.user.uuid;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Create Transaction', () => {
    it('should create a deposit transaction', async () => {
      const response = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          user_id: userUuid,
          type: TransactionType.DEPOSIT,
          amount: 100,
          description: 'Test deposit',
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('uuid');
      expect(response.body.data).toHaveProperty('reference');
      expect(response.body.data.amount).toBe(100);
      expect(response.body.data.type).toBe(TransactionType.DEPOSIT);

      transactionUuid = response.body.data.uuid;
    });

    it('should not create transaction without authentication', async () => {
      await request(app.getHttpServer())
        .post('/transactions')
        .send({
          user_id: userUuid,
          type: TransactionType.DEPOSIT,
          amount: 100,
        })
        .expect(401);
    });
  });

  describe('Get Transactions', () => {
    it('should get all user transactions', async () => {
      const response = await request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get transaction by uuid', async () => {
      const response = await request(app.getHttpServer())
        .get(`/transactions/${transactionUuid}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.uuid).toBe(transactionUuid);
    });

    it('should get user balance', async () => {
      const response = await request(app.getHttpServer())
        .get(`/transactions/balance/${userUuid}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('balance');
      expect(typeof response.body.data.balance).toBe('number');
    });
  });

  describe('Update Transaction', () => {
    it('should update transaction status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/transactions/${transactionUuid}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'COMPLETED',
        })
        .expect(200);

      expect(response.body.data.status).toBe('COMPLETED');
    });
  });
});
