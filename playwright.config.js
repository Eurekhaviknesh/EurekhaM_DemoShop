/**
 * playwright.config.js
 * Playwright configuration for the DemoWebShop E2E automation suite.
 *
 * Usage:
 *   npx playwright test --config playwright.config.js
 */

import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import config from './config/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  // ── Test discovery ────────────────────────────────────────────────────────
  testDir: './tests',
  testMatch: ['**/*.spec.js'],

  // ── Execution options ─────────────────────────────────────────────────────
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: config.browser.timeout,

  // ── Reporters ─────────────────────────────────────────────────────────────
  reporter: [
    [
      './utils/ExtentReporter.js',
      {
        outputDir:   config.reporter.outputDir,
        reportTitle: config.reporter.reportTitle,
      },
    ],
    ['list'],
  ],

  // ── Shared test options ───────────────────────────────────────────────────
  use: {
    baseURL:           config.baseUrl,
    headless:          config.browser.headless,
    slowMo:            config.browser.slowMo,
    viewport:          { width: 1280, height: 800 },
    screenshot:        'only-on-failure',
    video:             'retain-on-failure',
    trace:             'on-first-retry',
    actionTimeout:     15_000,
    navigationTimeout: 30_000,
    ignoreHTTPSErrors: true,
  },

  // ── Browser projects ──────────────────────────────────────────────────────
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  outputDir: 'test-results',
});
