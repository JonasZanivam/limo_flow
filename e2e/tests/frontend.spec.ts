import { expect, test } from '@playwright/test';

test.describe('Frontend smoke', () => {
  test('deve carregar o dashboard com sidebar', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'LimoFlow' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Clientes' })).toBeVisible();
    await expect(page.getByText('Casamentos hoje')).toBeVisible();
  });

  test('deve navegar para página de clientes', async ({ page }) => {
    await page.goto('/clientes');

    await expect(page.getByText('Clientes').first()).toBeVisible();
    await expect(
      page.getByText('CRUD de clientes com indicação e ações WhatsApp.'),
    ).toBeVisible();
  });
});
