import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TicketPriority } from '../src/common/enums';

describe('Support Flow (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userUuid: string;
  let ticketUuid: string;

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
        email: `support${Date.now()}@example.com`,
        phone: '+1234567890',
        firstName: 'Support',
        lastName: 'Test',
        password: 'password123',
      });

    authToken = registerResponse.body.data.access_token;
    userUuid = registerResponse.body.data.user.uuid;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Create Support Ticket', () => {
    it('should create a new support ticket', async () => {
      const response = await request(app.getHttpServer())
        .post('/support/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          user_id: userUuid,
          subject: 'Need help with recharge',
          priority: TicketPriority.MEDIUM,
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('uuid');
      expect(response.body.data).toHaveProperty('subject');
      expect(response.body.data.status).toBe('OPEN');

      ticketUuid = response.body.data.uuid;
    });

    it('should not create ticket without authentication', async () => {
      await request(app.getHttpServer())
        .post('/support/tickets')
        .send({
          user_id: userUuid,
          subject: 'Test ticket',
          priority: TicketPriority.LOW,
        })
        .expect(401);
    });
  });

  describe('Get Support Tickets', () => {
    it('should get all user tickets', async () => {
      const response = await request(app.getHttpServer())
        .get('/support/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should get ticket by uuid with messages', async () => {
      const response = await request(app.getHttpServer())
        .get(`/support/tickets/${ticketUuid}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.uuid).toBe(ticketUuid);
    });

    it('should get ticket statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/support/tickets/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('open');
    });
  });

  describe('Support Messages', () => {
    it('should add message to ticket', async () => {
      const response = await request(app.getHttpServer())
        .post(`/support/messages/${ticketUuid}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'I need help with my recharge',
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data.message).toBe('I need help with my recharge');
    });

    it('should get messages for ticket', async () => {
      const response = await request(app.getHttpServer())
        .get(`/support/messages/ticket/${ticketUuid}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Update Support Ticket', () => {
    it('should update ticket status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/support/tickets/${ticketUuid}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'IN_PROGRESS',
        })
        .expect(200);

      expect(response.body.data.status).toBe('IN_PROGRESS');
    });
  });
});
