import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { applySecurity } from '../src/common/security/security';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let refreshToken: string;

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
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: process.env.SEED_ADMIN_EMAIL ?? 'admin@limoflow.com',
        password: process.env.SEED_ADMIN_PASSWORD ?? 'admin123',
      })
      .expect(200);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body.user.role).toBe('ADMIN');

    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });

  it('/users (GET) deve listar usuários para ADMIN', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
        expect(res.body[0]).not.toHaveProperty('password');
      });
  });

  it('/auth/refresh (POST) deve renovar tokens', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    refreshToken = response.body.refreshToken;
  });

  it('/auth/logout (POST) deve encerrar sessão', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken })
      .expect(204);
  });
});
