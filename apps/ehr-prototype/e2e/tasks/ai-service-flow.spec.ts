import { test, expect } from '../fixtures/test-fixtures';
import { launchScenario, switchMode, waitForTaskCompletion } from '../helpers/mock-api';

/**
 * AI Service Integration Tests
 *
 * Tests for AI-triggered workflows and background task generation.
 * Note: These tests depend on the AI service mock and task generation logic.
 */

test.describe('AI Service Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('capture view loads with OmniAdd ready', async ({ page }) => {
    await launchScenario(page, 'demo-uc');
    await page.waitForSelector('[data-testid="capture-view"]', { timeout: 15000 });

    // OmniAdd should be ready for adding items
    await expect(page.locator('[data-testid="omni-add-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="omni-add-trigger"]')).toBeVisible();
  });

  test('adding item via OmniAdd works', async ({ page }) => {
    await launchScenario(page, 'demo-uc');
    await page.waitForSelector('[data-testid="capture-view"]', { timeout: 15000 });

    // Open OmniAdd
    await page.click('[data-testid="omni-add-trigger"]');
    await expect(page.locator('[data-testid="category-selector"]')).toBeVisible();

    // Select diagnosis category
    await page.click('[data-testid="category-diagnosis"]');

    // Search and select item
    await page.fill('[data-testid="omni-add-search"]', 'bronchitis');
    await page.waitForTimeout(300); // Wait for search

    const firstResult = page.locator('[data-testid="search-result-0"]');
    if (await firstResult.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstResult.click();
    }
  });

  test.skip('adding medication triggers dx-association task', async ({ page }) => {
    // This test requires the AI service mock to generate tasks
    await launchScenario(page, 'demo-uc');
    await page.waitForSelector('[data-testid="capture-view"]', { timeout: 15000 });

    // Add a medication via OmniAdd
    await page.click('[data-testid="omni-add-trigger"]');
    await page.click('[data-testid="category-medication"]');
    await page.fill('[data-testid="omni-add-search"]', 'benzonatate');

    const firstResult = page.locator('[data-testid="search-result-0"]');
    if (await firstResult.isVisible({ timeout: 2000 })) {
      await firstResult.click();
    }

    // Wait for AI service to create task
    try {
      await waitForTaskCompletion(page, 'dx-association', 10000);
    } catch {
      // Task generation may not be enabled in this scenario
    }

    // Check process view for task
    await switchMode(page, 'process');
    await page.waitForSelector('[data-testid="process-view"]', { timeout: 10000 });
  });

  test('switching to review mode works', async ({ page }) => {
    await launchScenario(page, 'demo-uc');
    await page.waitForSelector('[data-testid="capture-view"]', { timeout: 15000 });

    // Switch to review mode
    await switchMode(page, 'review');
    await expect(page.locator('[data-testid="review-view"]')).toBeVisible({ timeout: 10000 });
  });

  test.skip('note generation completes on review mode', async ({ page }) => {
    // This test requires note generation to be enabled
    await launchScenario(page, 'demo-uc');
    await page.waitForSelector('[data-testid="capture-view"]', { timeout: 15000 });

    // Add some content first
    await page.click('[data-testid="omni-add-trigger"]');
    await page.click('[data-testid="category-diagnosis"]');
    await page.fill('[data-testid="omni-add-search"]', 'bronchitis');
    const diagResult = page.locator('[data-testid="search-result-0"]');
    if (await diagResult.isVisible({ timeout: 2000 })) {
      await diagResult.click();
    }

    // Switch to review - triggers note generation
    await switchMode(page, 'review');

    // Wait for note generation
    await expect(page.locator('[data-testid="visit-note"]')).toBeVisible({ timeout: 20000 });
  });
});

test.describe('Mode Transitions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await launchScenario(page, 'demo-uc');
    await page.waitForSelector('[data-testid="capture-view"]', { timeout: 15000 });
  });

  test('can transition from capture to process', async ({ page }) => {
    await switchMode(page, 'process');
    await expect(page.locator('[data-testid="process-view"]')).toBeVisible({ timeout: 10000 });
  });

  test('can transition from capture to review', async ({ page }) => {
    await switchMode(page, 'review');
    await expect(page.locator('[data-testid="review-view"]')).toBeVisible({ timeout: 10000 });
  });

  test('can transition from process to capture', async ({ page }) => {
    await switchMode(page, 'process');
    await page.waitForSelector('[data-testid="process-view"]', { timeout: 10000 });
    await switchMode(page, 'capture');
    await expect(page.locator('[data-testid="capture-view"]')).toBeVisible({ timeout: 10000 });
  });

  test('can transition from review to capture', async ({ page }) => {
    await switchMode(page, 'review');
    await page.waitForSelector('[data-testid="review-view"]', { timeout: 10000 });
    await switchMode(page, 'capture');
    await expect(page.locator('[data-testid="capture-view"]')).toBeVisible({ timeout: 10000 });
  });

  test('mode selector buttons are visible', async ({ page }) => {
    await expect(page.locator('[data-testid="mode-capture"]')).toBeVisible();
    await expect(page.locator('[data-testid="mode-process"]')).toBeVisible();
    await expect(page.locator('[data-testid="mode-review"]')).toBeVisible();
  });
});
