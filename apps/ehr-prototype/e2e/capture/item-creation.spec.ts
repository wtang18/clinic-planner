import { test, expect } from '../fixtures/test-fixtures';
import { launchScenario } from '../helpers/mock-api';

test.describe('Capture View - Item Creation via OmniAdd', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await launchScenario(page, 'demo-uc');
    await page.waitForSelector('[data-testid="capture-view"]', { timeout: 15000 });
  });

  test('opens OmniAdd when trigger button clicked', async ({ page }) => {
    // Click the add button
    await page.click('[data-testid="omni-add-trigger"]');

    // Category selector should appear
    await expect(page.locator('[data-testid="category-selector"]')).toBeVisible();
  });

  test('selects a category and shows search input', async ({ page }) => {
    // Open OmniAdd
    await page.click('[data-testid="omni-add-trigger"]');
    await expect(page.locator('[data-testid="category-selector"]')).toBeVisible();

    // Select medication category
    await page.click('[data-testid="category-medication"]');

    // Search input should appear
    await expect(page.locator('[data-testid="omni-add-search"]')).toBeVisible();
  });

  test('searches and shows results', async ({ page }) => {
    // Open OmniAdd and select category
    await page.click('[data-testid="omni-add-trigger"]');
    await page.click('[data-testid="category-medication"]');

    // Type in search
    await page.fill('[data-testid="omni-add-search"]', 'lisinopril');

    // Wait for search results
    await expect(page.locator('[data-testid="search-result-0"]')).toBeVisible({ timeout: 5000 });
  });

  test('selects search result and shows detail form', async ({ page }) => {
    // Open OmniAdd, select category, search
    await page.click('[data-testid="omni-add-trigger"]');
    await page.click('[data-testid="category-medication"]');
    await page.fill('[data-testid="omni-add-search"]', 'lisinopril');

    // Wait for and click first result
    await page.click('[data-testid="search-result-0"]');

    // Detail form should appear
    await expect(page.locator('[data-testid="item-detail-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-item-btn"]')).toBeVisible();
  });

  test('navigates through full add item flow to form', async ({ page }) => {
    // Open OmniAdd
    await page.click('[data-testid="omni-add-trigger"]');

    // Select category
    await page.click('[data-testid="category-medication"]');

    // Search and select
    await page.fill('[data-testid="omni-add-search"]', 'metformin');
    await page.click('[data-testid="search-result-0"]');

    // Verify form is displayed with Add button
    await expect(page.locator('[data-testid="item-detail-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-item-btn"]')).toBeVisible();
  });

  test('submits form and closes OmniAdd', async ({ page }) => {
    // Capture console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    // Navigate to form
    await page.click('[data-testid="omni-add-trigger"]');
    await page.click('[data-testid="category-medication"]');
    await page.fill('[data-testid="omni-add-search"]', 'metformin');
    await page.click('[data-testid="search-result-0"]');
    await expect(page.locator('[data-testid="add-item-btn"]')).toBeVisible();

    // Click Add Item
    await page.click('[data-testid="add-item-btn"]');

    // Check for errors
    if (errors.length > 0) {
      console.log('Errors after Add Item click:', errors);
    }

    // Verify form closes
    await expect(page.locator('[data-testid="item-detail-form"]')).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="omni-add-trigger"]')).toBeVisible();
  });

  test('cancel button closes OmniAdd', async ({ page }) => {
    // Open OmniAdd
    await page.click('[data-testid="omni-add-trigger"]');
    await expect(page.locator('[data-testid="category-selector"]')).toBeVisible();

    // Click cancel
    await page.click('[data-testid="omni-add-cancel"]');

    // Should return to collapsed state
    await expect(page.locator('[data-testid="category-selector"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="omni-add-trigger"]')).toBeVisible();
  });

  test('back button navigates to previous step', async ({ page }) => {
    // Open OmniAdd and go to search
    await page.click('[data-testid="omni-add-trigger"]');
    await page.click('[data-testid="category-medication"]');
    await expect(page.locator('[data-testid="omni-add-search"]')).toBeVisible();

    // Click back
    await page.click('[data-testid="omni-add-back"]');

    // Should return to category selector
    await expect(page.locator('[data-testid="category-selector"]')).toBeVisible();
  });

  test('escape key closes OmniAdd', async ({ page }) => {
    // Open OmniAdd
    await page.click('[data-testid="omni-add-trigger"]');
    await expect(page.locator('[data-testid="category-selector"]')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Should return to collapsed state
    await expect(page.locator('[data-testid="category-selector"]')).not.toBeVisible();
  });

  test('more button expands secondary categories', async ({ page }) => {
    // Open OmniAdd
    await page.click('[data-testid="omni-add-trigger"]');
    await expect(page.locator('[data-testid="category-selector"]')).toBeVisible();

    // Click more
    await page.click('[data-testid="category-more"]');

    // Secondary category should be visible (e.g., vitals)
    await expect(page.locator('[data-testid="category-vitals"]')).toBeVisible();
  });
});
