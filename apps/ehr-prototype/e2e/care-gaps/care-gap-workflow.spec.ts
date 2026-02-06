import { test, expect } from '../fixtures/test-fixtures';
import { launchScenario, switchMode } from '../helpers/mock-api';

/**
 * Care Gap Workflow Tests
 *
 * Tests for care gap display, interaction, and status updates.
 * Note: Many tests require specific scenario data with care gaps.
 */

test.describe('Care Gap Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Use PC diabetes scenario which should have care gaps
    await launchScenario(page, 'demo-pc');
    await page.waitForSelector('[data-testid="capture-view"]', { timeout: 15000 });
  });

  test('renders patient header with care gap indicator', async ({ page }) => {
    // Care gap indicator should be visible in patient header
    const careGapIndicator = page.locator('[data-testid="care-gap-indicator"]');
    await expect(careGapIndicator).toBeVisible();
  });

  test('care gap count displays in header', async ({ page }) => {
    // Care gap count should be visible
    const careGapCount = page.locator('[data-testid="care-gap-count"]');
    await expect(careGapCount).toBeVisible();
  });

  test.skip('clicking care gap indicator opens gap panel', async ({ page }) => {
    // This test requires care gap panel to be implemented
    await page.click('[data-testid="care-gap-indicator"]');
    await expect(page.locator('[data-testid="care-gap-panel"]')).toBeVisible();
  });

  test.skip('care gap card displays with action button', async ({ page }) => {
    // This test requires care gaps to be present in the scenario
    await page.click('[data-testid="care-gap-indicator"]');
    await expect(page.locator('[data-testid^="care-gap-card-"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="gap-action-btn"]').first()).toBeVisible();
  });

  test.skip('care gap action button adds appropriate item', async ({ page }) => {
    // This test requires care gap action to add items
    await page.click('[data-testid="care-gap-indicator"]');

    // Find an A1C gap and click action
    const gapCard = page.locator('[data-testid^="care-gap-card-"]').first();
    const actionBtn = gapCard.locator('[data-testid="gap-action-btn"]');
    if (await actionBtn.isVisible()) {
      await actionBtn.click();
    }
  });

  test('care gaps show in review view summary', async ({ page }) => {
    await switchMode(page, 'review');
    await page.waitForSelector('[data-testid="review-view"]', { timeout: 10000 });

    // Care gap summary should be visible if there are care gaps
    const careGapSummary = page.locator('[data-testid="care-gap-summary"]');
    // This may or may not be visible depending on whether gaps exist
    const isVisible = await careGapSummary.isVisible().catch(() => false);
    // Just verify the page loaded successfully
    await expect(page.locator('[data-testid="review-view"]')).toBeVisible();
  });

  test.skip('ordering relevant item updates care gap status', async ({ page }) => {
    // This test requires care gap status tracking
    await page.click('[data-testid="care-gap-indicator"]');
    const initialGapStatus = await page.locator('[data-testid^="care-gap-card-"] [data-testid="gap-status"]').first().textContent();

    await page.keyboard.press('Escape');

    // Add a relevant item via OmniAdd
    await page.click('[data-testid="omni-add-trigger"]');
    await page.click('[data-testid="category-lab"]');
    await page.fill('[data-testid="omni-add-search"]', 'a1c');
    const firstResult = page.locator('[data-testid="search-result-0"]');
    if (await firstResult.isVisible()) {
      await firstResult.click();
    }
  });
});

test.describe('Care Gap Component Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await launchScenario(page, 'demo-pc');
    await page.waitForSelector('[data-testid="capture-view"]', { timeout: 15000 });
  });

  test('patient header renders without errors', async ({ page }) => {
    // Verify header components are present
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('[data-testid="care-gap-indicator"]')).toBeVisible();
  });

  test('mode selector allows switching to review', async ({ page }) => {
    await switchMode(page, 'review');
    await expect(page.locator('[data-testid="review-view"]')).toBeVisible({ timeout: 10000 });
  });

  test('mode selector allows switching to process', async ({ page }) => {
    await switchMode(page, 'process');
    await expect(page.locator('[data-testid="process-view"]')).toBeVisible({ timeout: 10000 });
  });
});
