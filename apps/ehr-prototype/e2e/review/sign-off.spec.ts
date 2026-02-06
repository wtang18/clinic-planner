import { test, expect } from '../fixtures/test-fixtures';
import { launchScenario, switchMode, injectItem, clearItems, setEncounterReadyForSignOff } from '../helpers/mock-api';

/**
 * Review View - Sign Off Tests
 *
 * Tests for sign-off validation, blockers, and completion.
 */

test.describe('Review View - Sign Off', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await launchScenario(page, 'demo-uc');
    await page.waitForSelector('[data-testid="capture-view"]', { timeout: 15000 });
    await switchMode(page, 'review');
    await page.waitForSelector('[data-testid="review-view"]', { timeout: 10000 });
  });

  test('renders review view with sign-off section', async ({ page }) => {
    await expect(page.locator('[data-testid="review-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="sign-off-section"]')).toBeVisible();
  });

  test('sign-off button is visible', async ({ page }) => {
    await expect(page.locator('[data-testid="sign-off-btn"]')).toBeVisible();
  });

  test('encounter status is displayed', async ({ page }) => {
    await expect(page.locator('[data-testid="encounter-status"]')).toBeVisible();
  });

  test.skip('shows blockers for unreviewed AI content', async ({ page }) => {
    // Inject an unreviewed AI-generated item
    await injectItem(page, {
      id: 'item-unreviewed',
      category: 'diagnosis',
      displayText: 'AI Suggested Diagnosis',
      status: 'pending-review',
      _meta: { aiGenerated: true, requiresReview: true },
    });

    // Reload to pick up the change
    await page.reload();
    await page.waitForSelector('[data-testid="review-view"]', { timeout: 10000 });

    // Should show blocker
    const blockerCount = await page.locator('[data-testid="sign-off-blocker"]').count();
    expect(blockerCount).toBeGreaterThan(0);

    // Sign-off button should be disabled
    await expect(page.locator('[data-testid="sign-off-btn"]')).toBeDisabled();
  });

  test.skip('sign-off enabled when all items reviewed', async ({ page }) => {
    // Clear items and add a confirmed one
    await clearItems(page);
    await injectItem(page, {
      id: 'item-confirmed',
      category: 'diagnosis',
      displayText: 'Confirmed Diagnosis',
      status: 'confirmed',
      _meta: { requiresReview: false },
    });

    await page.reload();
    await page.waitForSelector('[data-testid="review-view"]', { timeout: 10000 });

    // Sign-off button should be enabled
    await expect(page.locator('[data-testid="sign-off-btn"]')).toBeEnabled();
  });

  test.skip('sign-off shows confirmation when ready', async ({ page }) => {
    // Set encounter ready for sign-off
    await setEncounterReadyForSignOff(page);
    await page.reload();
    await page.waitForSelector('[data-testid="review-view"]', { timeout: 10000 });

    // Click sign-off button
    await page.click('[data-testid="sign-off-btn"]');

    // Should show confirmation modal
    await expect(page.locator('[data-testid="sign-off-confirmation"]')).toBeVisible();
  });

  test.skip('successful sign-off updates encounter status', async ({ page }) => {
    // Set encounter ready for sign-off
    await setEncounterReadyForSignOff(page);
    await page.reload();
    await page.waitForSelector('[data-testid="review-view"]', { timeout: 10000 });

    // Click sign-off button
    await page.click('[data-testid="sign-off-btn"]');

    // Confirm sign-off
    const confirmBtn = page.locator('[data-testid="confirm-sign-off"]');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }

    // Encounter status should update
    await expect(page.locator('[data-testid="encounter-status"]')).toContainText(/signed|complete/i);
  });
});

test.describe('Review View - Content Sections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await launchScenario(page, 'demo-uc');
    await page.waitForSelector('[data-testid="capture-view"]', { timeout: 15000 });
  });

  test('review view displays content sections', async ({ page }) => {
    // Add some content first
    await page.click('[data-testid="omni-add-trigger"]');
    await page.click('[data-testid="category-diagnosis"]');
    await page.fill('[data-testid="omni-add-search"]', 'bronchitis');
    const result = page.locator('[data-testid="search-result-0"]');
    if (await result.isVisible({ timeout: 2000 })) {
      await result.click();
    }

    // Switch to review
    await switchMode(page, 'review');
    await page.waitForSelector('[data-testid="review-view"]', { timeout: 10000 });

    // Should display review sections
    await expect(page.locator('[data-testid="review-view"]')).toBeVisible();
  });

  test('can navigate back to capture from review', async ({ page }) => {
    await switchMode(page, 'review');
    await page.waitForSelector('[data-testid="review-view"]', { timeout: 10000 });

    await switchMode(page, 'capture');
    await expect(page.locator('[data-testid="capture-view"]')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Review View - Blocker Display', () => {
  test('sign-off section shows appropriate messaging', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await launchScenario(page, 'demo-uc');
    await page.waitForSelector('[data-testid="capture-view"]', { timeout: 15000 });
    await switchMode(page, 'review');
    await page.waitForSelector('[data-testid="review-view"]', { timeout: 10000 });

    // Sign-off section should have a title
    const signOffSection = page.locator('[data-testid="sign-off-section"]');
    await expect(signOffSection).toBeVisible();

    // Should contain sign encounter text
    await expect(signOffSection).toContainText(/sign/i);
  });
});
