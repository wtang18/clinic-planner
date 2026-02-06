import type { Page } from '@playwright/test';

/**
 * Launch a demo scenario by clicking its card on the DemoLauncher.
 */
export async function launchScenario(page: Page, scenarioId: string) {
  const card = page.locator(`[data-testid="scenario-card-${scenarioId}"]`);
  await card.waitFor({ state: 'visible' });
  // Click the "Start Encounter" button within the card
  await card.locator('button', { hasText: 'Start Encounter' }).click();
}

/**
 * Switch the encounter mode by clicking a mode selector button.
 */
export async function switchMode(page: Page, mode: 'capture' | 'process' | 'review') {
  const modeButton = page.locator(`[data-testid="mode-${mode}"]`);
  await modeButton.click();
}

/**
 * Inject mock transcription events via a window hook.
 */
export async function mockTranscriptionEvents(
  page: Page,
  segments: Array<{ text: string; speaker?: string; timestamp?: number }>
) {
  await page.evaluate((segs) => {
    const win = window as unknown as Record<string, unknown>;
    if (typeof win.__TEST_INJECT_TRANSCRIPTION__ === 'function') {
      (win.__TEST_INJECT_TRANSCRIPTION__ as (s: typeof segs) => void)(segs);
    }
  }, segments);
}

/**
 * Read the current encounter state from a window hook.
 */
export async function getEncounterState(page: Page) {
  return page.evaluate(() => {
    const win = window as unknown as Record<string, unknown>;
    if (typeof win.__TEST_GET_ENCOUNTER_STATE__ === 'function') {
      return (win.__TEST_GET_ENCOUNTER_STATE__ as () => unknown)();
    }
    return null;
  });
}

/**
 * Inject a task via window hook.
 */
export async function injectTask(
  page: Page,
  task: {
    id: string;
    type: string;
    status: string;
    displayTitle?: string;
    displayStatus?: string;
    priority?: string;
    trigger?: { itemId?: string };
    result?: unknown;
    error?: string;
    progress?: number;
  }
) {
  await page.evaluate((t) => {
    const win = window as unknown as Record<string, unknown>;
    if (typeof win.__TEST_INJECT_TASK__ === 'function') {
      (win.__TEST_INJECT_TASK__ as (task: typeof t) => void)(t);
    }
  }, task);
}

/**
 * Inject a chart item via window hook.
 */
export async function injectItem(
  page: Page,
  item: {
    id: string;
    category: string;
    displayText: string;
    status?: string;
    _meta?: {
      aiGenerated?: boolean;
      requiresReview?: boolean;
    };
  }
) {
  await page.evaluate((i) => {
    const win = window as unknown as Record<string, unknown>;
    if (typeof win.__TEST_INJECT_ITEM__ === 'function') {
      (win.__TEST_INJECT_ITEM__ as (item: typeof i) => void)(i);
    }
  }, item);
}

/**
 * Clear all items via window hook.
 */
export async function clearItems(page: Page) {
  await page.evaluate(() => {
    const win = window as unknown as Record<string, unknown>;
    if (typeof win.__TEST_CLEAR_ITEMS__ === 'function') {
      (win.__TEST_CLEAR_ITEMS__ as () => void)();
    }
  });
}

/**
 * Wait for a task of the given type to reach a terminal state.
 */
export async function waitForTaskCompletion(
  page: Page,
  taskType: string,
  timeoutMs: number = 10000
) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const state = await getEncounterState(page) as Record<string, unknown> | null;
    if (state?.entities) {
      const entities = state.entities as { tasks?: Record<string, { type: string; status: string }> };
      const tasks = Object.values(entities.tasks || {});
      const matchingTask = tasks.find(
        (t) => t.type === taskType && ['completed', 'ready', 'pending-review', 'failed'].includes(t.status)
      );
      if (matchingTask) {
        return matchingTask;
      }
    }
    await page.waitForTimeout(200);
  }

  throw new Error(`Timeout waiting for task of type "${taskType}" to complete`);
}

/**
 * Set the encounter ready for sign-off via window hook.
 */
export async function setEncounterReadyForSignOff(page: Page) {
  await page.evaluate(() => {
    const win = window as unknown as Record<string, unknown>;
    if (typeof win.__TEST_SET_ENCOUNTER_READY__ === 'function') {
      (win.__TEST_SET_ENCOUNTER_READY__ as () => void)();
    }
  });
}
