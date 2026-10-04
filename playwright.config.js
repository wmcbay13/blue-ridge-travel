// Smoke tests for the static site. Uses system Chromium when CHROMIUM_PATH is set
// (e.g. CHROMIUM_PATH=/usr/bin/chromium npm test), otherwise Playwright's bundled browser.
import { defineConfig, devices } from '@playwright/test';

const launchOptions = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};

export default defineConfig({
  testDir: 'tests',
  timeout: 30000,
  use: { baseURL: 'http://localhost:8766', launchOptions },
  webServer: { command: 'python3 -m http.server 8766 2>/dev/null', port: 8766, reuseExistingServer: true },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], launchOptions } },
    { name: 'phone', use: { ...devices['Pixel 7'], launchOptions } },
  ],
});
