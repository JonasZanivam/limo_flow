import { expect, test } from '@playwright/test';

const apiUrl = process.env.API_URL ?? 'http://localhost:3000';

test.describe('API auth', () => {
  test('health deve responder ok', async ({ request }) => {
    const response = await request.get(`${apiUrl}/health`);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('limoflow-api');
  });

  test('login admin deve retornar tokens', async ({ request }) => {
    const response = await request.post(`${apiUrl}/auth/login`, {
      data: {
        email: process.env.SEED_ADMIN_EMAIL ?? 'admin@limoflow.com',
        password: process.env.SEED_ADMIN_PASSWORD ?? 'admin123',
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.accessToken).toBeTruthy();
    expect(body.refreshToken).toBeTruthy();
    expect(body.user.role).toBe('ADMIN');
  });

  test('users deve exigir autenticação', async ({ request }) => {
    const response = await request.get(`${apiUrl}/users`);
    expect(response.status()).toBe(401);
  });
});
