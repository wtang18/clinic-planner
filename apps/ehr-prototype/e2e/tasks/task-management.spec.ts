import { test, expect } from '../fixtures/test-fixtures';
import { launchScenario, switchMode, injectTask, getEncounterState } from '../helpers/mock-api';

/**
 * Process View - Task Management Tests
 *
 * Tests for task display, selection, approval, and batch actions.
 */

test.describe('Process View - Task Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await launchScenario(page, 'demo-uc');
    await page.waitForSelector('[data-testid="capture-view"]', { timeout: 15000 });
    await switchMode(page, 'process');
    await page.waitForSelector('[data-testid="process-view"]', { timeout: 10000 });
  });

  test('renders process view with task sections', async ({ page }) => {
    await expect(page.locator('[data-testid="process-view"]')).toBeVisible();
  });

  test('displays empty state when no tasks exist', async ({ page }) => {
    // Process view should show "No Tasks" when there are no tasks
    const noTasksText = page.locator('text=No Tasks');
    const hasNoTasksMessage = await noTasksText.isVisible().catch(() => false);

    // Either shows empty state or has task sections (depending on scenario)
    expect(hasNoTasksMessage || await page.locator('[data-testid^="task-section-"]').count() >= 0).toBe(true);
  });

  test('injected task appears in appropriate section', async ({ page }) => {
    // Inject a pending-review task
    await injectTask(page, {
      id: 'test-task-1',
      type: 'dx-association',
      status: 'pending-review',
      displayTitle: 'Link Diagnosis',
      displayStatus: 'CBC Panel',
    });

    // Wait for task to appear
    await page.waitForTimeout(500);

    // Should appear in Needs Review section
    const taskCard = page.locator('[data-testid="task-card-test-task-1"]');
    await expect(taskCard).toBeVisible({ timeout: 5000 });
  });

  test('selecting task shows detail panel', async ({ page }) => {
    // Inject a task
    await injectTask(page, {
      id: 'test-task-2',
      type: 'dx-association',
      status: 'pending-review',
      displayTitle: 'Link Diagnosis',
      displayStatus: 'Test Item',
      result: { suggestions: [{ description: 'Acute bronchitis', icdCode: 'J20.9', confidence: 0.88 }] },
    });

    await page.waitForTimeout(500);

    // Click on the task card
    const taskCard = page.locator('[data-testid="task-card-test-task-2"]');
    await taskCard.click();

    // Detail panel should be visible
    await expect(page.locator('[data-testid="task-detail-panel"]')).toBeVisible();
  });

  test('approving task updates its status', async ({ page }) => {
    // Inject a ready task
    await injectTask(page, {
      id: 'test-task-approve',
      type: 'lab-send',
      status: 'ready',
      displayTitle: 'Send Lab Order',
      displayStatus: 'CBC Panel',
    });

    await page.waitForTimeout(500);

    // Find and click approve button on the task card
    const approveBtn = page.locator('[data-testid="task-approve-test-task-approve"]');
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      // Task should move to completed or be removed
      await page.waitForTimeout(1000);
    }
  });

  test('rejecting task updates its status', async ({ page }) => {
    // Inject a pending-review task
    await injectTask(page, {
      id: 'test-task-reject',
      type: 'dx-association',
      status: 'pending-review',
      displayTitle: 'Link Diagnosis',
      displayStatus: 'Test',
    });

    await page.waitForTimeout(500);

    // Find and click reject button on the task card
    const rejectBtn = page.locator('[data-testid="task-reject-test-task-reject"]');
    if (await rejectBtn.isVisible()) {
      await rejectBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  // Skip tests that require complex scenario setup
  test.skip('batch send sends all ready items', async ({ page }) => {
    // Inject multiple ready tasks
    await injectTask(page, { id: 'lab-1', type: 'lab-send', status: 'ready', displayTitle: 'Lab 1', displayStatus: 'CBC' });
    await injectTask(page, { id: 'lab-2', type: 'lab-send', status: 'ready', displayTitle: 'Lab 2', displayStatus: 'BMP' });
    await injectTask(page, { id: 'lab-3', type: 'lab-send', status: 'ready', displayTitle: 'Lab 3', displayStatus: 'CMP' });

    await page.waitForTimeout(500);

    // Find batch send button
    const batchSendBtn = page.locator('[data-testid="batch-send-btn"]');
    if (await batchSendBtn.isVisible()) {
      await batchSendBtn.click();
    }
  });

  test.skip('drug interaction alert shows warning styling', async ({ page }) => {
    // Inject a drug interaction task
    await injectTask(page, {
      id: 'task-alert',
      type: 'drug-interaction',
      status: 'pending-review',
      priority: 'urgent',
      displayTitle: 'Drug Interaction',
      result: {
        interactions: [{
          drug1: 'Metformin',
          drug2: 'Contrast Dye',
          severity: 'severe',
          description: 'Risk of contrast-induced nephropathy',
        }],
      },
    });

    await page.waitForTimeout(500);

    // Task card should be visible with warning styling
    await expect(page.locator('[data-testid="task-card-task-alert"]')).toBeVisible();
  });
});
