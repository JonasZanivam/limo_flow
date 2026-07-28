import { defineConfig, devices } from '@playwright/test';

const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
const apiUrl = process.env.API_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: frontendUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.CI
    ? undefined
    : [
        {
          command: 'npm run start:dev',
          cwd: '../backend',
          url: `${apiUrl}/health`,
          reuseExistingServer: true,
          timeout: 120_000,
        },
        {
          command: 'npm run dev',
          cwd: '../frontend',
          url: frontendUrl,
          reuseExistingServer: true,
          timeout: 120_000,
        },
      ],
});
