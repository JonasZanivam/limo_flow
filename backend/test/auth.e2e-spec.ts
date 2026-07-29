import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { applySecurity } from '../src/common/security/security';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({ bufferLogs: true });
    applySecurity(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET) deve ser público', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.service).toBe('limoflow-api');
      });
  });

  it('/users (GET) deve exigir autenticação', () => {
    return request(app.getHttpServer()).get('/users').expect(401);
  });

  it('/auth/login (POST) deve autenticar admin demo', async () => {
    const agent = request.agent(app.getHttpServer());

    const response = await agent
      .post('/auth/login')
      .send({
        email: process.env.SEED_ADMIN_EMAIL ?? 'admin@limoflow.com',
        password: process.env.SEED_ADMIN_PASSWORD ?? 'admin123',
      })
      .expect(200);

    expect(response.body.user.role).toBe('ADMIN');
    expect(response.body.accessToken).toBeUndefined();
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringContaining('access_token='),
        expect.stringContaining('refresh_token='),
      ]),
    );

    await agent
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
        expect(res.body[0]).not.toHaveProperty('password');
      });

    await agent
      .get('/auth/me')
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe(
          process.env.SEED_ADMIN_EMAIL ?? 'admin@limoflow.com',
        );
      });

    await agent
      .post('/auth/refresh')
      .expect(200)
      .expect((res) => {
        expect(res.body.user.role).toBe('ADMIN');
        expect(res.body.accessToken).toBeUndefined();
      });

    await agent.post('/auth/logout').expect(204);
    await agent.get('/users').expect(401);
  });
});
