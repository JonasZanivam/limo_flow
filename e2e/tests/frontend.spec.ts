import { expect, test } from '@playwright/test';

const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@limoflow.com';
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(adminEmail);
  await page.getByLabel('Senha').fill(adminPassword);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
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

    await expect(
      page.getByRole('heading', { name: 'Clientes' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Novo cliente' }),
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

  test('deve listar veículos na página de frota', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/veiculos');

    await expect(
      page.getByRole('heading', { name: 'Veículos' }),
    ).toBeVisible();
    await expect(page.getByText('ABC-1D23')).toBeVisible();
    await expect(page.getByText('Mercedes-Benz Sprinter Luxo')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Novo veículo' }),
    ).toBeVisible();
  });

  test('deve exibir a agenda com calendário', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/agenda');

    await expect(page.getByRole('heading', { name: 'Agenda' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Novo evento' }),
    ).toBeVisible();
    await expect(page.locator('.fc')).toBeVisible();
    await expect(page.getByText('Confirmado')).toBeVisible();
  });

  test('deve exibir checklist ao editar evento', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/agenda');

    await page.locator('.fc-event').first().click();
    await expect(page.getByText('Checklist pré-evento')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Carro lavado' })).toBeVisible();
  });

  test('deve listar propostas na página comercial', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/propostas');

    await expect(
      page.getByRole('heading', { name: 'Propostas' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Nova proposta' }),
    ).toBeVisible();
  });

  test('deve listar contratos emitidos', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/contratos');

    await expect(
      page.getByRole('heading', { name: 'Contratos' }),
    ).toBeVisible();
    await expect(page.getByText('Contratos emitidos')).toBeVisible();
  });

  test('deve listar pagamentos no financeiro', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/financeiro');

    await expect(
      page.getByRole('heading', { name: 'Financeiro' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Novo pagamento' }),
    ).toBeVisible();
  });
});
