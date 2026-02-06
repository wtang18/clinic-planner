import { test, expect } from './fixtures/test-fixtures';
import { launchScenario } from './helpers/mock-api';

test.describe('EHR Prototype Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('app loads and DemoLauncher is visible', async ({ page }) => {
    const launcher = page.locator('[data-testid="demo-launcher"]');
    await expect(launcher).toBeVisible();
  });

  test('scenario cards are rendered', async ({ page }) => {
    const cards = page.locator('[data-testid^="scenario-card-"]');
    await expect(cards).toHaveCount(3);
  });

  test('clicking a scenario card navigates away from DemoLauncher', async ({ page }) => {
    // Verify we start on DemoLauncher
    const launcher = page.locator('[data-testid="demo-launcher"]');
    await expect(launcher).toBeVisible();

    // Click the scenario card
    await launchScenario(page, 'demo-uc');

    // Wait for navigation - DemoLauncher should no longer be visible
    await expect(launcher).not.toBeVisible({ timeout: 10000 });
  });
});
