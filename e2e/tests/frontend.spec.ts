import { expect, test } from '@playwright/test';

const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@limoflow.com';
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(adminEmail);
  await page.getByLabel('Senha').fill(adminPassword);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByText('Bem-vindo,')).toBeVisible();
}

test.describe('Frontend smoke', () => {
  test('deve redirecionar para login quando não autenticado', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  });

  test('deve carregar o dashboard após login admin', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Clientes' })).toBeVisible();
    await expect(page.getByText('Casamentos hoje')).toBeVisible();
  });

  test('deve navegar para página de clientes', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/clientes');

    await expect(page.getByText('Clientes').first()).toBeVisible();
    await expect(
      page.getByText('CRUD de clientes com indicação e ações WhatsApp.'),
    ).toBeVisible();
  });

  test('deve listar usuários na página de equipe', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/usuarios');

    await expect(
      page.getByRole('heading', { name: 'Usuários' }),
    ).toBeVisible();
    await expect(page.getByText('admin@limoflow.com')).toBeVisible();
    await expect(page.getByText('motorista@limoflow.com')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Novo usuário' }),
    ).toBeVisible();
  });
});
