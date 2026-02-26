# Phase 6: Demo Polish & E2E Testing — Claude Code Prompts

This document contains Claude Code prompts for creating end-to-end tests, demo enhancements, and production polish for stakeholder presentations.

> **Platform**: Expo/React Native with Web target. E2E tests run against Expo Web (`expo start --web`). Components use React Native primitives (`View`, `Text`, `Pressable`) with `react-native-web` for browser rendering. Styling uses inline `React.CSSProperties` or `StyleSheet.create()` with design token foundations.

---

## Overview

| Chunk | Description | Est. Files |
|-------|-------------|-----------|
| 6.1 | Playwright E2E Setup (Expo Web) | 5 |
| 6.2 | Capture Flow E2E Tests | 4 |
| 6.3 | Task & Care Gap E2E Tests | 4 |
| 6.4 | Demo Mode Controller | 4 |
| 6.5 | Guided Tour System | 4 |
| 6.6 | Performance Optimization | 4 |
| 6.7 | Error Boundaries & Recovery | 3 |
| 6.8 | Keyboard Shortcuts System (Web) | 3 |
| 6.9 | Demo Presets & Enhanced Launcher | 4 |
| 6.10 | Final Integration & Polish | 3 |

---

## Chunk 6.1: Playwright E2E Setup

### Prompt

Set up Playwright for end-to-end testing of the EHR application targeting the Expo Web build.

## Requirements

### 1. Install Playwright
```bash
cd apps/ehr-prototype
npm install -D @playwright/test
npx playwright install chromium
```

### 2. CREATE `apps/ehr-prototype/playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],

  webServer: {
    command: 'npx expo start --web --port 8081',
    url: 'http://localhost:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### 3. CREATE `apps/ehr-prototype/e2e/fixtures/test-fixtures.ts`

> Note: React Native's `testID` prop maps to `data-testid` on web via react-native-web. All selectors use `[data-testid="..."]`.

```typescript
import { test as base, expect, Page } from '@playwright/test';

// Page object models
class CaptureViewPage {
  constructor(private page: Page) {}

  async waitForReady() {
    await this.page.waitForSelector('[data-testid="capture-view"]', { timeout: 15000 });
  }

  async addItemViaOmniAdd(category: string, searchText: string) {
    await this.page.click('[data-testid="omni-add-input"]');
    await this.page.click(`[data-testid="category-${category}"]`);
    await this.page.fill('[data-testid="omni-add-search"]', searchText);
    await this.page.click('[data-testid="search-result-0"]');
  }

  async acceptSuggestion(index: number = 0) {
    await this.page.click(`[data-testid="suggestion-chip-${index}"] [data-testid="accept-btn"]`);
  }

  async dismissSuggestion(index: number = 0) {
    await this.page.click(`[data-testid="suggestion-chip-${index}"] [data-testid="dismiss-btn"]`);
  }

  async toggleTranscription() {
    await this.page.click('[data-testid="transcription-toggle"]');
  }

  async getItemCount(): Promise<number> {
    return await this.page.locator('[data-testid="chart-item-card"]').count();
  }

  async getSuggestionCount(): Promise<number> {
    return await this.page.locator('[data-testid="suggestion-chip"]').count();
  }

  async switchMode(mode: 'capture' | 'process' | 'review') {
    await this.page.click(`[data-testid="mode-${mode}"]`);
  }
}

class ProcessViewPage {
  constructor(private page: Page) {}

  async waitForReady() {
    await this.page.waitForSelector('[data-testid="process-view"]', { timeout: 15000 });
  }

  async selectTask(taskId: string) {
    await this.page.click(`[data-testid="task-card-${taskId}"]`);
  }

  async approveTask(taskId: string) {
    await this.page.click(`[data-testid="task-approve-${taskId}"]`);
  }

  async batchSend() {
    await this.page.click('[data-testid="batch-send-btn"]');
    await this.page.click('[data-testid="confirm-send"]');
  }

  async getTaskCountByStatus(status: string): Promise<number> {
    return await this.page.locator(`[data-testid="task-section-${status}"] [data-testid="task-card"]`).count();
  }
}

class ReviewViewPage {
  constructor(private page: Page) {}

  async waitForReady() {
    await this.page.waitForSelector('[data-testid="review-view"]', { timeout: 15000 });
  }

  async getBlockerCount(): Promise<number> {
    return await this.page.locator('[data-testid="sign-off-blocker"]').count();
  }

  async signOff() {
    await this.page.click('[data-testid="sign-off-btn"]');
  }

  async expandSection(section: string) {
    await this.page.click(`[data-testid="section-${section}"] [data-testid="expand-btn"]`);
  }
}

// Extended test fixture
interface EHRFixtures {
  captureView: CaptureViewPage;
  processView: ProcessViewPage;
  reviewView: ReviewViewPage;
}

export const test = base.extend<EHRFixtures>({
  captureView: async ({ page }, use) => {
    await use(new CaptureViewPage(page));
  },
  processView: async ({ page }, use) => {
    await use(new ProcessViewPage(page));
  },
  reviewView: async ({ page }, use) => {
    await use(new ReviewViewPage(page));
  },
});

export { expect };
```

### 4. CREATE `apps/ehr-prototype/e2e/helpers/mock-api.ts`

> The Expo Web build exposes test hooks on `window` when `__DEV__` is true. These helpers interact with those hooks.

```typescript
import { Page } from '@playwright/test';

export async function mockTranscriptionEvents(page: Page, segments: Array<{ id: string; text: string; confidence: number }>) {
  await page.evaluate((segs) => {
    (window as any).__mockTranscriptionSegments = segs;
    (window as any).__useMockTranscription = true;
  }, segments);
}

export async function mockAIServiceResponse(page: Page, serviceId: string, response: unknown) {
  await page.evaluate(({ id, resp }) => {
    (window as any).__mockAIResponses = (window as any).__mockAIResponses || {};
    (window as any).__mockAIResponses[id] = resp;
  }, { id: serviceId, resp: response });
}

export async function waitForTaskCompletion(page: Page, taskType: string, timeout: number = 5000) {
  await page.waitForFunction(
    (type) => {
      const state = (window as any).__getEncounterState?.();
      if (!state) return false;
      return Object.values(state.entities.tasks).some(
        (t: any) => t.type === type && t.status === 'completed'
      );
    },
    taskType,
    { timeout }
  );
}

export async function getEncounterState(page: Page) {
  return await page.evaluate(() => (window as any).__getEncounterState?.());
}

/**
 * Navigate to a scenario by clicking the demo launcher card.
 * Since the app uses NavigationContext (not URL routing), we interact via UI.
 */
export async function launchScenario(page: Page, scenarioId: string) {
  // Ensure we're on the demo launcher
  await page.waitForSelector('[data-testid="demo-launcher"]', { timeout: 10000 });
  await page.click(`[data-testid="scenario-card-${scenarioId}"]`);
}

/**
 * Switch encounter mode via the mode selector buttons.
 */
export async function switchMode(page: Page, mode: 'capture' | 'process' | 'review') {
  await page.click(`[data-testid="mode-${mode}"]`);
}
```

### 5. UPDATE `apps/ehr-prototype/package.json` scripts
Add the following scripts:
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

### 6. UPDATE `.gitignore`
Add:
```
playwright-report/
test-results/
```

## Guidelines
- Use page object models (POM) for maintainability
- Existing components must include `testID` props (which map to `data-testid` on web)
- Navigate via UI interactions (click scenario cards, mode buttons) since the app uses NavigationContext, not URL routing
- Configure for CI/CD environments with Expo Web

---

## Chunk 6.2: Capture Flow E2E Tests

### Prompt

Create E2E tests for the Capture flow covering item creation, suggestions, and transcription. Tests interact with the Expo Web build via Playwright.

## Requirements

### 1. CREATE `apps/ehr-prototype/e2e/capture/item-creation.spec.ts`
```typescript
import { test, expect } from '../fixtures/test-fixtures';
import { launchScenario } from '../helpers/mock-api';

test.describe('Capture View - Item Creation', () => {
  test.beforeEach(async ({ page, captureView }) => {
    await page.goto('/');
    await launchScenario(page, 'demo-uc');
    await captureView.waitForReady();
  });

  test('adds medication via OmniAdd', async ({ captureView, page }) => {
    const initialCount = await captureView.getItemCount();

    await captureView.addItemViaOmniAdd('medication', 'benzonatate');

    await expect(page.locator('[data-testid="chart-item-card"]')).toHaveCount(initialCount + 1);
    await expect(page.locator('text=Benzonatate')).toBeVisible();
  });

  test('adds lab via OmniAdd with vendor selection', async ({ captureView, page }) => {
    await captureView.addItemViaOmniAdd('lab', 'cbc');

    // Should show vendor selection
    await expect(page.locator('[data-testid="vendor-selector"]')).toBeVisible();
    await page.click('[data-testid="vendor-quest"]');

    await expect(page.locator('text=CBC Panel')).toBeVisible();
    await expect(page.locator('text=Quest')).toBeVisible();
  });

  test('adds diagnosis with ICD-10 code', async ({ captureView, page }) => {
    await captureView.addItemViaOmniAdd('diagnosis', 'bronchitis');

    await expect(page.locator('text=Acute bronchitis')).toBeVisible();
    await expect(page.locator('text=J20.9')).toBeVisible();
  });

  test('adds vitals with validation', async ({ page }) => {
    await page.click('[data-testid="omni-add-input"]');
    await page.click('[data-testid="category-vitals"]');

    // Fill vital measurements
    await page.fill('[data-testid="vital-bp-systolic"]', '128');
    await page.fill('[data-testid="vital-bp-diastolic"]', '82');
    await page.fill('[data-testid="vital-pulse"]', '78');
    await page.fill('[data-testid="vital-temp"]', '98.6');
    await page.fill('[data-testid="vital-spo2"]', '98');

    await page.click('[data-testid="add-vitals-btn"]');

    await expect(page.locator('text=128/82')).toBeVisible();
  });

  test('shows validation error for invalid dosage', async ({ page }) => {
    await page.click('[data-testid="omni-add-input"]');
    await page.click('[data-testid="category-medication"]');
    await page.fill('[data-testid="omni-add-search"]', 'metformin');
    await page.click('[data-testid="search-result-0"]');

    // Enter invalid dosage
    await page.fill('[data-testid="dosage-input"]', 'invalid');
    await page.click('[data-testid="add-item-btn"]');

    await expect(page.locator('[data-testid="dosage-error"]')).toBeVisible();
  });

  test('keyboard shortcut opens OmniAdd', async ({ page }) => {
    await page.keyboard.press('a');

    await expect(page.locator('[data-testid="omni-add-input"]')).toBeFocused();
  });

  test('escape closes OmniAdd', async ({ page }) => {
    await page.click('[data-testid="omni-add-input"]');
    await page.click('[data-testid="category-medication"]');

    await page.keyboard.press('Escape');

    await expect(page.locator('[data-testid="category-selector"]')).not.toBeVisible();
  });
});
```

### 2. CREATE `apps/ehr-prototype/e2e/capture/suggestions.spec.ts`
```typescript
import { test, expect } from '../fixtures/test-fixtures';
import { launchScenario, mockTranscriptionEvents } from '../helpers/mock-api';

test.describe('Capture View - Suggestions', () => {
  test.beforeEach(async ({ page, captureView }) => {
    await page.goto('/');
    await launchScenario(page, 'demo-uc');
    await captureView.waitForReady();
  });

  test('displays suggestions from transcription', async ({ captureView, page }) => {
    await mockTranscriptionEvents(page, [
      { id: 'seg-1', text: 'Patient reports cough for 5 days', confidence: 0.92 },
    ]);

    await captureView.toggleTranscription();

    // Wait for suggestion to appear
    await expect(page.locator('[data-testid="suggestion-chip"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Cough')).toBeVisible();
  });

  test('accepting suggestion creates chart item', async ({ captureView, page }) => {
    // Inject test suggestion via window hook
    await page.evaluate(() => {
      (window as any).__injectSuggestion?.({
        id: 'sug-test',
        displayText: 'Acute bronchitis J20.9',
        confidence: 0.92,
        type: 'chart-item',
        content: { type: 'new-item', category: 'diagnosis' },
      });
    });

    const initialItemCount = await captureView.getItemCount();

    await captureView.acceptSuggestion(0);

    await expect(page.locator('[data-testid="chart-item-card"]')).toHaveCount(initialItemCount + 1);
    await expect(page.locator('[data-testid="suggestion-chip"]')).toHaveCount(0);
  });

  test('dismissing suggestion removes it', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__injectSuggestion?.({
        id: 'sug-dismiss',
        displayText: 'Test suggestion',
        confidence: 0.75,
      });
    });

    await page.click('[data-testid="suggestion-chip-0"] [data-testid="dismiss-btn"]');

    await expect(page.locator('[data-testid="suggestion-chip"]')).toHaveCount(0);
  });

  test('max 4 suggestions displayed', async ({ captureView, page }) => {
    for (let i = 0; i < 6; i++) {
      await page.evaluate((idx) => {
        (window as any).__injectSuggestion?.({
          id: `sug-${idx}`,
          displayText: `Suggestion ${idx}`,
          confidence: 0.9 - idx * 0.05,
        });
      }, i);
    }

    const suggestionCount = await captureView.getSuggestionCount();
    expect(suggestionCount).toBeLessThanOrEqual(4);
  });

  test('clicking suggestion shows detail panel', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__injectSuggestion?.({
        id: 'sug-detail',
        displayText: 'Acute bronchitis J20.9',
        confidence: 0.92,
        reasoning: 'Based on: "cough for 5 days, worse at night"',
      });
    });

    await page.click('[data-testid="suggestion-chip-0"]');

    await expect(page.locator('[data-testid="suggestion-detail-panel"]')).toBeVisible();
    await expect(page.locator('text=Based on:')).toBeVisible();
  });
});
```

### 3. CREATE `apps/ehr-prototype/e2e/capture/transcription.spec.ts`
```typescript
import { test, expect } from '../fixtures/test-fixtures';
import { launchScenario, mockTranscriptionEvents } from '../helpers/mock-api';

test.describe('Capture View - Transcription', () => {
  test.beforeEach(async ({ page, captureView }) => {
    await page.goto('/');
    await launchScenario(page, 'demo-uc');
    await captureView.waitForReady();
  });

  test('starts and stops transcription', async ({ captureView, page }) => {
    // Initial state: idle
    await expect(page.locator('[data-testid="transcription-status"]')).toContainText('Tap to record');

    // Start recording
    await captureView.toggleTranscription();
    await expect(page.locator('[data-testid="transcription-status"]')).toContainText('Recording');

    // Stop recording
    await captureView.toggleTranscription();
    await expect(page.locator('[data-testid="transcription-status"]')).toContainText('Paused');
  });

  test('transcription segments generate suggestions', async ({ captureView, page }) => {
    await mockTranscriptionEvents(page, [
      { id: 'seg-1', text: 'Patient is taking Lisinopril 10mg daily', confidence: 0.95 },
    ]);

    await captureView.toggleTranscription();

    // Wait for entity extraction and suggestion
    await expect(page.locator('[data-testid="suggestion-chip"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Lisinopril')).toBeVisible();
  });

  test('minibar shows transcription indicator', async ({ captureView, page }) => {
    await captureView.toggleTranscription();

    await expect(page.locator('[data-testid="minibar-transcription"]')).toBeVisible();
  });

  test('keyboard shortcut toggles transcription', async ({ page }) => {
    await page.keyboard.press('t');

    await expect(page.locator('[data-testid="transcription-status"]')).toContainText('Recording');

    await page.keyboard.press('t');

    await expect(page.locator('[data-testid="transcription-status"]')).toContainText('Paused');
  });
});
```

### 4. CREATE `apps/ehr-prototype/e2e/capture/mode-switching.spec.ts`
```typescript
import { test, expect } from '../fixtures/test-fixtures';
import { launchScenario } from '../helpers/mock-api';

test.describe('Mode Switching', () => {
  test.beforeEach(async ({ page, captureView }) => {
    await page.goto('/');
    await launchScenario(page, 'demo-uc');
    await captureView.waitForReady();
  });

  test('navigates between modes', async ({ captureView, page }) => {
    // Capture → Process
    await captureView.switchMode('process');
    await expect(page.locator('[data-testid="process-view"]')).toBeVisible();

    // Process → Review
    await page.click('[data-testid="mode-review"]');
    await expect(page.locator('[data-testid="review-view"]')).toBeVisible();

    // Review → Capture
    await page.click('[data-testid="mode-capture"]');
    await expect(page.locator('[data-testid="capture-view"]')).toBeVisible();
  });

  test('triggers note generation when switching to review', async ({ captureView, page }) => {
    // Add some items first
    await captureView.addItemViaOmniAdd('diagnosis', 'bronchitis');
    await captureView.addItemViaOmniAdd('medication', 'benzonatate');

    // Switch to review
    await captureView.switchMode('review');

    // Should see note generation indicator or generated note
    await expect(
      page.locator('[data-testid="note-section"]').or(page.locator('[data-testid="note-generating"]'))
    ).toBeVisible({ timeout: 10000 });
  });
});
```

## Guidelines
- Test realistic clinical workflows
- Use mock injection via `window.__inject*` hooks for AI responses
- Test keyboard accessibility (web-only shortcuts)
- Include timeout handling for async AI operations
- Navigate via UI elements (not URL changes) since app uses NavigationContext

---

## Chunk 6.3: Task & Care Gap E2E Tests

### Prompt

Create E2E tests for Task management and Care Gap workflows.

## Requirements

### 1. CREATE `apps/ehr-prototype/e2e/tasks/task-management.spec.ts`
```typescript
import { test, expect } from '../fixtures/test-fixtures';
import { launchScenario, waitForTaskCompletion, getEncounterState, switchMode } from '../helpers/mock-api';

test.describe('Process View - Task Management', () => {
  test.beforeEach(async ({ page, processView }) => {
    await page.goto('/');
    await launchScenario(page, 'demo-uc');
    await page.waitForSelector('[data-testid="capture-view"]');
    await switchMode(page, 'process');
    await processView.waitForReady();
  });

  test('displays tasks grouped by status', async ({ page }) => {
    await expect(page.locator('[data-testid="task-section-needsReview"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-section-readyToSend"]')).toBeVisible();
  });

  test('selecting task shows detail panel', async ({ processView, page }) => {
    await page.evaluate(() => {
      (window as any).__injectTask?.({
        id: 'task-test',
        type: 'dx-association',
        status: 'pending-review',
        displayTitle: 'Link diagnosis',
        displayStatus: 'CBC Panel',
        result: { suggestions: [{ description: 'Acute bronchitis', icdCode: 'J20.9', confidence: 0.88 }] },
      });
    });

    await processView.selectTask('task-test');

    await expect(page.locator('[data-testid="task-detail-panel"]')).toBeVisible();
    await expect(page.locator('text=Acute bronchitis')).toBeVisible();
  });

  test('approving dx-association task links diagnosis', async ({ processView, page }) => {
    await page.evaluate(() => {
      (window as any).__injectTask?.({
        id: 'task-dx',
        type: 'dx-association',
        status: 'pending-review',
        trigger: { itemId: 'item-cbc' },
        result: { suggestions: [{ description: 'Acute bronchitis', icdCode: 'J20.9', confidence: 0.92 }] },
      });
    });

    await processView.selectTask('task-dx');
    await page.click('[data-testid="dx-suggestion-0"]');
    await processView.approveTask('task-dx');

    const state = await getEncounterState(page);
    expect(state.entities.tasks['task-dx'].status).toBe('completed');
  });

  test('batch send sends all ready items', async ({ processView, page }) => {
    await page.evaluate(() => {
      ['lab-1', 'lab-2', 'lab-3'].forEach(id => {
        (window as any).__injectTask?.({
          id,
          type: 'lab-send',
          status: 'ready',
          displayTitle: 'Send Lab',
          displayStatus: id,
        });
      });
    });

    const readyCount = await processView.getTaskCountByStatus('readyToSend');
    expect(readyCount).toBe(3);

    await processView.batchSend();

    const completedCount = await processView.getTaskCountByStatus('completed');
    expect(completedCount).toBeGreaterThanOrEqual(3);
  });

  test('drug interaction alert shows warning', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__injectTask?.({
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
    });

    await expect(page.locator('[data-testid="task-card-task-alert"]')).toBeVisible();
    await expect(page.locator('text=Drug Interaction')).toBeVisible();
  });
});
```

### 2. CREATE `apps/ehr-prototype/e2e/care-gaps/care-gap-workflow.spec.ts`
```typescript
import { test, expect } from '../fixtures/test-fixtures';
import { launchScenario } from '../helpers/mock-api';

test.describe('Care Gap Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Use diabetes scenario which has care gaps
    await launchScenario(page, 'demo-pc');
    await page.waitForSelector('[data-testid="capture-view"]', { timeout: 15000 });
  });

  test('displays open care gaps in patient header', async ({ page }) => {
    await expect(page.locator('[data-testid="care-gap-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="care-gap-count"]')).toContainText(/[1-9]/);
  });

  test('clicking care gap indicator opens gap panel', async ({ page }) => {
    await page.click('[data-testid="care-gap-indicator"]');

    await expect(page.locator('[data-testid="care-gap-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="care-gap-card"]').first()).toBeVisible();
  });

  test('care gap action button adds appropriate item', async ({ page }) => {
    await page.click('[data-testid="care-gap-indicator"]');

    // Find A1C gap and click action
    await page.click('[data-testid="gap-dm-a1c"] [data-testid="gap-action-btn"]');

    // Should add A1C lab to chart
    await expect(page.locator('text=Hemoglobin A1C')).toBeVisible();
  });

  test('ordering relevant item addresses care gap', async ({ page, captureView }) => {
    await page.click('[data-testid="care-gap-indicator"]');
    const initialGapStatus = await page.locator('[data-testid="gap-dm-a1c"] [data-testid="gap-status"]').textContent();
    expect(initialGapStatus).toContain('open');

    await page.keyboard.press('Escape'); // Close panel

    // Add A1C lab manually
    await captureView.addItemViaOmniAdd('lab', 'a1c');

    // Check gap status updated
    await page.click('[data-testid="care-gap-indicator"]');
    await expect(page.locator('[data-testid="gap-dm-a1c"] [data-testid="gap-status"]')).toContainText('pending');
  });

  test('care gaps show in review view summary', async ({ page }) => {
    await page.click('[data-testid="mode-review"]');
    await page.waitForSelector('[data-testid="review-view"]');

    await expect(page.locator('[data-testid="care-gap-summary"]')).toBeVisible();
  });
});
```

### 3. CREATE `apps/ehr-prototype/e2e/tasks/ai-service-flow.spec.ts`
```typescript
import { test, expect } from '../fixtures/test-fixtures';
import { launchScenario, waitForTaskCompletion, switchMode } from '../helpers/mock-api';

test.describe('AI Service Integration', () => {
  test('adding medication triggers dx-association task', async ({ page, captureView }) => {
    await page.goto('/');
    await launchScenario(page, 'demo-uc');
    await captureView.waitForReady();

    await captureView.addItemViaOmniAdd('medication', 'benzonatate');

    // Wait for AI service to create task
    await waitForTaskCompletion(page, 'dx-association', 10000);

    // Verify task exists in process view
    await captureView.switchMode('process');
    await expect(page.locator('[data-testid="task-section-needsReview"]')).toContainText('diagnosis');
  });

  test('note generation completes on review mode', async ({ page, captureView }) => {
    await page.goto('/');
    await launchScenario(page, 'demo-uc');
    await captureView.waitForReady();

    // Add some content
    await captureView.addItemViaOmniAdd('diagnosis', 'bronchitis');
    await captureView.addItemViaOmniAdd('medication', 'benzonatate');

    // Switch to review - triggers note generation
    await captureView.switchMode('review');

    // Wait for note generation
    await expect(page.locator('[data-testid="visit-note"]')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('[data-testid="note-content"]')).not.toBeEmpty();
  });
});
```

### 4. CREATE `apps/ehr-prototype/e2e/review/sign-off.spec.ts`
```typescript
import { test, expect } from '../fixtures/test-fixtures';
import { launchScenario, switchMode } from '../helpers/mock-api';

test.describe('Review View - Sign Off', () => {
  test.beforeEach(async ({ page, reviewView }) => {
    await page.goto('/');
    await launchScenario(page, 'demo-uc');
    await page.waitForSelector('[data-testid="capture-view"]');
    await switchMode(page, 'review');
    await reviewView.waitForReady();
  });

  test('shows blockers for incomplete items', async ({ reviewView, page }) => {
    await page.evaluate(() => {
      (window as any).__injectItem?.({
        id: 'item-unreviewed',
        category: 'diagnosis',
        displayText: 'AI Suggested Diagnosis',
        _meta: { aiGenerated: true, requiresReview: true },
      });
    });

    const blockerCount = await reviewView.getBlockerCount();
    expect(blockerCount).toBeGreaterThan(0);

    await expect(page.locator('[data-testid="sign-off-btn"]')).toBeDisabled();
  });

  test('sign-off enabled when all items reviewed', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__clearItems?.();
      (window as any).__injectItem?.({
        id: 'item-confirmed',
        category: 'diagnosis',
        displayText: 'Confirmed Diagnosis',
        status: 'confirmed',
        _meta: { requiresReview: false },
      });
    });

    await page.reload();
    await page.waitForSelector('[data-testid="review-view"]');

    await expect(page.locator('[data-testid="sign-off-btn"]')).toBeEnabled();
  });

  test('sign-off shows confirmation modal', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__setEncounterReadyForSignOff?.();
    });
    await page.reload();
    await page.waitForSelector('[data-testid="review-view"]');

    await page.click('[data-testid="sign-off-btn"]');

    await expect(page.locator('[data-testid="sign-off-confirmation"]')).toBeVisible();
  });

  test('successful sign-off updates encounter status', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__setEncounterReadyForSignOff?.();
    });
    await page.reload();
    await page.waitForSelector('[data-testid="review-view"]');

    await page.click('[data-testid="sign-off-btn"]');
    await page.click('[data-testid="confirm-sign-off"]');

    await expect(page.locator('[data-testid="encounter-status"]')).toContainText('Signed');
  });
});
```

## Guidelines
- Test complete task lifecycle
- Verify care gap status transitions
- Test AI service integration end-to-end
- Navigate via UI elements (mode selector, scenario cards), not URLs
- Use `window.__inject*` hooks for test state setup

---

## Chunk 6.4: Demo Mode Controller

### Prompt

Create a demo mode controller for enhanced presentation capabilities. This integrates with the existing `src/scenarios/` system and `NavigationContext`.

## Requirements

### 1. CREATE `apps/ehr-prototype/src/demo/DemoController.ts`
```typescript
import type { EncounterState } from '../state/types';

// ============================================================================
// Types
// ============================================================================

export interface DemoEvent {
  type: 'scenario-loaded' | 'event-executed' | 'scenario-complete' | 'paused' | 'resumed' | 'step';
  payload?: any;
}

export interface DemoAnnotation {
  id: string;
  text: string;
  targetTestId?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  duration?: number;
  showAt: number;
}

export interface DemoState {
  isActive: boolean;
  currentScenarioId: string | null;
  eventIndex: number;
  totalEvents: number;
  isPaused: boolean;
  speed: number;
  annotations: DemoAnnotation[];
}

export interface DemoControllerConfig {
  dispatch: (action: any) => void;
  getState: () => EncounterState;
  onEvent?: (event: DemoEvent) => void;
  defaultSpeed?: number;
}

interface ScenarioEvent {
  description: string;
  action: any;
  delay?: number;
}

interface Scenario {
  id: string;
  name: string;
  events: ScenarioEvent[];
}

// ============================================================================
// Controller
// ============================================================================

export class DemoController {
  private config: DemoControllerConfig;
  private state: DemoState;
  private listeners: Set<(state: DemoState) => void> = new Set();
  private playbackTimer: ReturnType<typeof setTimeout> | null = null;
  private scenarios: Map<string, Scenario> = new Map();

  constructor(config: DemoControllerConfig) {
    this.config = config;
    this.state = {
      isActive: false,
      currentScenarioId: null,
      eventIndex: 0,
      totalEvents: 0,
      isPaused: false,
      speed: config.defaultSpeed || 1,
      annotations: [],
    };
  }

  // Scenario management
  registerScenario(scenario: Scenario) {
    this.scenarios.set(scenario.id, scenario);
  }

  getAvailableScenarios(): Scenario[] {
    return Array.from(this.scenarios.values());
  }

  loadScenario(scenarioId: string) {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) throw new Error(`Scenario not found: ${scenarioId}`);

    this.updateState({
      currentScenarioId: scenarioId,
      totalEvents: scenario.events.length,
      eventIndex: 0,
      annotations: this.generateAnnotations(scenario),
    });

    this.config.onEvent?.({ type: 'scenario-loaded', payload: scenario });
  }

  // Playback control
  start() {
    this.updateState({ isActive: true, isPaused: false });
    this.executeNextEvent();
  }

  pause() {
    if (this.playbackTimer) {
      clearTimeout(this.playbackTimer);
      this.playbackTimer = null;
    }
    this.updateState({ isPaused: true });
    this.config.onEvent?.({ type: 'paused' });
  }

  resume() {
    this.updateState({ isPaused: false });
    this.executeNextEvent();
    this.config.onEvent?.({ type: 'resumed' });
  }

  stop() {
    if (this.playbackTimer) {
      clearTimeout(this.playbackTimer);
      this.playbackTimer = null;
    }
    this.updateState({ isActive: false, isPaused: false, eventIndex: 0 });
  }

  // Step-through mode
  stepForward() {
    const scenario = this.getCurrentScenario();
    if (!scenario || this.state.eventIndex >= scenario.events.length) return;

    this.executeEvent(this.state.eventIndex);
    this.config.onEvent?.({ type: 'step', payload: 'forward' });
  }

  stepBackward() {
    if (this.state.eventIndex <= 0) return;
    this.updateState({ eventIndex: this.state.eventIndex - 1 });
    this.config.onEvent?.({ type: 'step', payload: 'backward' });
  }

  goToEvent(index: number) {
    const scenario = this.getCurrentScenario();
    if (!scenario || index < 0 || index >= scenario.events.length) return;
    this.updateState({ eventIndex: index });
  }

  // Speed control
  setSpeed(multiplier: number) {
    this.updateState({ speed: multiplier });
  }

  // State subscription
  subscribe(listener: (state: DemoState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState(): DemoState {
    return { ...this.state };
  }

  destroy() {
    if (this.playbackTimer) {
      clearTimeout(this.playbackTimer);
    }
    this.listeners.clear();
  }

  // Private methods
  private getCurrentScenario(): Scenario | null {
    if (!this.state.currentScenarioId) return null;
    return this.scenarios.get(this.state.currentScenarioId) || null;
  }

  private executeEvent(index: number) {
    const scenario = this.getCurrentScenario();
    if (!scenario || index >= scenario.events.length) return;

    const event = scenario.events[index];
    this.config.dispatch(event.action);
    this.updateState({ eventIndex: index + 1 });
    this.config.onEvent?.({ type: 'event-executed', payload: { event, index } });
  }

  private executeNextEvent() {
    if (this.state.isPaused || !this.state.isActive) return;

    const scenario = this.getCurrentScenario();
    if (!scenario) return;

    if (this.state.eventIndex >= scenario.events.length) {
      this.updateState({ isActive: false });
      this.config.onEvent?.({ type: 'scenario-complete' });
      return;
    }

    const event = scenario.events[this.state.eventIndex];
    const delay = (event.delay || 1500) / this.state.speed;

    this.playbackTimer = setTimeout(() => {
      this.executeEvent(this.state.eventIndex);
      this.executeNextEvent();
    }, delay);
  }

  private updateState(partial: Partial<DemoState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach(l => l(this.state));
  }

  private generateAnnotations(scenario: Scenario): DemoAnnotation[] {
    return scenario.events.map((event, index) => ({
      id: `ann-${index}`,
      text: event.description,
      position: 'bottom' as const,
      showAt: index,
      duration: 3000,
    }));
  }
}

export function createDemoController(config: DemoControllerConfig): DemoController {
  return new DemoController(config);
}
```

### 2. CREATE `apps/ehr-prototype/src/demo/DemoOverlay.tsx`

> Uses React Native primitives for cross-platform rendering. Works on Expo Web and native.

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Play, Pause, SkipBack, SkipForward, Square } from 'lucide-react';
import { DemoController, DemoState } from './DemoController';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../styles/foundations';

interface DemoOverlayProps {
  controller: DemoController;
}

export const DemoOverlay: React.FC<DemoOverlayProps> = ({ controller }) => {
  const [state, setState] = useState<DemoState>(controller.getState());
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    return controller.subscribe(setState);
  }, [controller]);

  if (!state.isActive && !state.currentScenarioId) {
    return null;
  }

  const progress = state.totalEvents > 0
    ? (state.eventIndex / state.totalEvents) * 100
    : 0;

  const currentAnnotation = state.annotations.find(a => a.showAt === state.eventIndex - 1);

  return (
    <View style={overlayStyles.container} testID="demo-overlay">
      {/* Progress bar */}
      <View style={overlayStyles.progressTrack}>
        <View style={[overlayStyles.progressBar, { width: `${progress}%` as any }]} />
      </View>

      {isExpanded && (
        <View style={overlayStyles.controls}>
          {/* Event counter */}
          <Text style={overlayStyles.eventCount}>
            {state.eventIndex} / {state.totalEvents}
          </Text>

          {/* Playback controls */}
          <View style={overlayStyles.playback}>
            <Pressable
              onPress={() => controller.stepBackward()}
              style={overlayStyles.controlBtn}
              disabled={state.eventIndex === 0}
            >
              <SkipBack size={16} color={colors.fg.neutral.primary} />
            </Pressable>

            {state.isPaused || !state.isActive ? (
              <Pressable
                onPress={() => state.isActive ? controller.resume() : controller.start()}
                style={[overlayStyles.controlBtn, overlayStyles.playBtn]}
              >
                <Play size={20} color={colors.fg.onAccent} />
              </Pressable>
            ) : (
              <Pressable
                onPress={() => controller.pause()}
                style={[overlayStyles.controlBtn, overlayStyles.playBtn]}
              >
                <Pause size={20} color={colors.fg.onAccent} />
              </Pressable>
            )}

            <Pressable
              onPress={() => controller.stepForward()}
              style={overlayStyles.controlBtn}
              disabled={state.eventIndex >= state.totalEvents}
            >
              <SkipForward size={16} color={colors.fg.neutral.primary} />
            </Pressable>

            <Pressable
              onPress={() => controller.stop()}
              style={overlayStyles.controlBtn}
            >
              <Square size={16} color={colors.fg.neutral.primary} />
            </Pressable>
          </View>

          {/* Speed control */}
          <Pressable
            onPress={() => {
              const speeds = [0.5, 1, 1.5, 2, 3];
              const nextIdx = (speeds.indexOf(state.speed) + 1) % speeds.length;
              controller.setSpeed(speeds[nextIdx]);
            }}
            style={overlayStyles.speedBtn}
          >
            <Text style={overlayStyles.speedText}>{state.speed}x</Text>
          </Pressable>
        </View>
      )}

      {/* Current annotation */}
      {currentAnnotation && (
        <View style={overlayStyles.annotation}>
          <Text style={overlayStyles.annotationText}>{currentAnnotation.text}</Text>
        </View>
      )}

      {/* Collapse toggle */}
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        style={overlayStyles.toggleBtn}
      >
        <Text style={overlayStyles.toggleText}>{isExpanded ? '−' : '+'}</Text>
      </Pressable>
    </View>
  );
};

const overlayStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bg.neutral.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.neutral.subtle,
    paddingHorizontal: spaceAround.default,
    paddingVertical: spaceAround.compact,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: 2,
    marginBottom: spaceAround.compact,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.bg.accent.primary,
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventCount: {
    fontSize: 12,
    color: colors.fg.neutral.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  playback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  },
  controlBtn: {
    padding: spaceAround.tight,
    borderRadius: borderRadius.sm,
  },
  playBtn: {
    backgroundColor: colors.bg.accent.primary,
    padding: spaceAround.compact,
    borderRadius: borderRadius.full,
  },
  speedBtn: {
    paddingHorizontal: spaceAround.compact,
    paddingVertical: spaceAround.nudge4,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.sm,
  },
  speedText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.secondary,
  },
  annotation: {
    marginTop: spaceAround.compact,
    paddingVertical: spaceAround.tight,
    paddingHorizontal: spaceAround.compact,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  annotationText: {
    fontSize: 13,
    color: colors.fg.neutral.secondary,
    textAlign: 'center',
  },
  toggleBtn: {
    position: 'absolute',
    top: -20,
    right: spaceAround.default,
    width: 24,
    height: 20,
    backgroundColor: colors.bg.neutral.primary,
    borderTopLeftRadius: borderRadius.sm,
    borderTopRightRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border.neutral.subtle,
  },
  toggleText: {
    fontSize: 14,
    color: colors.fg.neutral.secondary,
    fontWeight: typography.fontWeight.bold,
  },
});
```

### 3. CREATE `apps/ehr-prototype/src/demo/hooks/useDemoController.ts`
```typescript
import { useEffect, useState, useCallback, useRef } from 'react';
import { DemoController, DemoState, DemoControllerConfig } from '../DemoController';
import { useEncounterContext } from '../../context/EncounterContext';

interface UseDemoControllerOptions {
  autoInitialize?: boolean;
  onEvent?: (event: any) => void;
}

export function useDemoController(options: UseDemoControllerOptions = {}) {
  const { state, dispatch } = useEncounterContext();
  const controllerRef = useRef<DemoController | null>(null);
  const [demoState, setDemoState] = useState<DemoState | null>(null);

  useEffect(() => {
    if (options.autoInitialize && !controllerRef.current) {
      const ctrl = new DemoController({
        dispatch,
        getState: () => state,
        onEvent: options.onEvent,
      });
      controllerRef.current = ctrl;
      return ctrl.subscribe(setDemoState);
    }
  }, [options.autoInitialize]);

  useEffect(() => {
    return () => {
      controllerRef.current?.destroy();
    };
  }, []);

  const loadScenario = useCallback((scenarioId: string) => {
    controllerRef.current?.loadScenario(scenarioId);
  }, []);

  const controls = {
    start: () => controllerRef.current?.start(),
    pause: () => controllerRef.current?.pause(),
    resume: () => controllerRef.current?.resume(),
    stop: () => controllerRef.current?.stop(),
    stepForward: () => controllerRef.current?.stepForward(),
    stepBackward: () => controllerRef.current?.stepBackward(),
    setSpeed: (speed: number) => controllerRef.current?.setSpeed(speed),
    goToEvent: (index: number) => controllerRef.current?.goToEvent(index),
  };

  return {
    controller: controllerRef.current,
    state: demoState,
    loadScenario,
    controls,
    scenarios: controllerRef.current?.getAvailableScenarios() || [],
  };
}
```

### 4. CREATE `apps/ehr-prototype/src/demo/index.ts`
```typescript
export { DemoController, createDemoController } from './DemoController';
export type { DemoState, DemoEvent, DemoAnnotation, DemoControllerConfig } from './DemoController';
export { DemoOverlay } from './DemoOverlay';
export { useDemoController } from './hooks/useDemoController';
```

## Guidelines
- Support real-time and step-through modes
- Use React Native primitives (View, Text, Pressable) for cross-platform rendering
- Style with StyleSheet.create() using design token foundations
- Provide visual progress indication
- Enable speed adjustment for presentations

---

## Chunk 6.5: Guided Tour System

### Prompt

Create a guided tour system for onboarding and feature discovery. Uses React Native components with ref-based element measurement (no DOM `querySelector`).

## Requirements

### 1. CREATE `apps/ehr-prototype/src/tour/TourSystem.ts`
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// Types
// ============================================================================

export interface TourStep {
  id: string;
  targetTestId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  spotlightPadding?: number;
  waitForTestId?: string;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  steps: TourStep[];
  prerequisites?: string[];
  category: 'onboarding' | 'feature' | 'workflow';
}

export interface TourState {
  activeTour: Tour | null;
  currentStep: number;
  completedTours: string[];
  isRunning: boolean;
}

type TourListener = (state: TourState) => void;

// ============================================================================
// TourSystem
// ============================================================================

const STORAGE_KEY = 'ehr-completed-tours';

export class TourSystem {
  private tours: Map<string, Tour> = new Map();
  private state: TourState;
  private listeners: Set<TourListener> = new Set();

  constructor() {
    this.state = {
      activeTour: null,
      currentStep: 0,
      completedTours: [],
      isRunning: false,
    };
    this.loadCompletedTours();
  }

  // Tour registration
  registerTour(tour: Tour) {
    this.tours.set(tour.id, tour);
  }

  registerTours(tours: Tour[]) {
    tours.forEach(t => this.registerTour(t));
  }

  getTour(id: string): Tour | undefined {
    return this.tours.get(id);
  }

  getAvailableTours(): Tour[] {
    return Array.from(this.tours.values()).filter(tour => {
      if (tour.prerequisites) {
        return tour.prerequisites.every(p => this.state.completedTours.includes(p));
      }
      return true;
    });
  }

  // Tour control
  startTour(tourId: string) {
    const tour = this.tours.get(tourId);
    if (!tour) throw new Error(`Tour not found: ${tourId}`);

    this.updateState({
      activeTour: tour,
      currentStep: 0,
      isRunning: true,
    });
  }

  nextStep() {
    if (!this.state.activeTour) return;

    const nextIndex = this.state.currentStep + 1;
    if (nextIndex >= this.state.activeTour.steps.length) {
      this.completeTour();
    } else {
      this.updateState({ currentStep: nextIndex });
    }
  }

  previousStep() {
    if (!this.state.activeTour || this.state.currentStep === 0) return;
    this.updateState({ currentStep: this.state.currentStep - 1 });
  }

  skipTour() {
    this.updateState({
      activeTour: null,
      currentStep: 0,
      isRunning: false,
    });
  }

  // State access
  subscribe(listener: TourListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState(): TourState {
    return { ...this.state };
  }

  // Private
  private completeTour() {
    const tourId = this.state.activeTour?.id;
    if (tourId) {
      const completed = [...this.state.completedTours, tourId];
      this.saveCompletedTours(completed);
      this.updateState({
        activeTour: null,
        currentStep: 0,
        isRunning: false,
        completedTours: completed,
      });
    }
  }

  private updateState(partial: Partial<TourState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach(l => l(this.state));
  }

  private async loadCompletedTours() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.updateState({ completedTours: JSON.parse(stored) });
      }
    } catch {
      // Ignore storage errors
    }
  }

  private async saveCompletedTours(tours: string[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tours));
    } catch {
      // Ignore storage errors
    }
  }
}

export const tourSystem = new TourSystem();
```

### 2. CREATE `apps/ehr-prototype/src/tour/TourOverlay.tsx`

> Uses a React Native `Modal` with a semi-transparent backdrop and positioned tooltip. Element measurement uses the TourTargetRegistry (ref-based, no DOM queries).

```typescript
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, LayoutRectangle } from 'react-native';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { tourSystem, TourState, TourStep } from './TourSystem';
import { useTourTargets } from './TourTargetRegistry';
import { colors, spaceAround, spaceBetween, borderRadius, typography, shadows } from '../styles/foundations';
import { Button } from '../components/primitives/Button';

export const TourOverlay: React.FC = () => {
  const [state, setState] = useState<TourState>(tourSystem.getState());
  const { measureTarget } = useTourTargets();
  const [targetRect, setTargetRect] = useState<LayoutRectangle | null>(null);

  useEffect(() => {
    return tourSystem.subscribe(setState);
  }, []);

  useEffect(() => {
    if (state.isRunning && state.activeTour) {
      const step = state.activeTour.steps[state.currentStep];
      measureTarget(step.targetTestId).then(rect => {
        setTargetRect(rect);
      });
    } else {
      setTargetRect(null);
    }
  }, [state.isRunning, state.currentStep, state.activeTour]);

  if (!state.isRunning || !state.activeTour) return null;

  const step = state.activeTour.steps[state.currentStep];
  const totalSteps = state.activeTour.steps.length;

  return (
    <Modal transparent visible={state.isRunning} animationType="fade">
      {/* Backdrop */}
      <View style={tourStyles.backdrop}>
        {/* Tooltip */}
        <View style={[tourStyles.tooltip, getTooltipPosition(step.position, targetRect)]}>
          <View style={tourStyles.tooltipHeader}>
            <Text style={tourStyles.tooltipTitle}>{step.title}</Text>
            <Pressable onPress={() => tourSystem.skipTour()} style={tourStyles.closeBtn}>
              <X size={16} color={colors.fg.neutral.secondary} />
            </Pressable>
          </View>

          <Text style={tourStyles.tooltipContent}>{step.content}</Text>

          <View style={tourStyles.tooltipFooter}>
            <Text style={tourStyles.stepIndicator}>
              {state.currentStep + 1} of {totalSteps}
            </Text>

            <View style={tourStyles.tooltipActions}>
              {state.currentStep > 0 && (
                <Pressable onPress={() => tourSystem.previousStep()} style={tourStyles.navBtn}>
                  <ChevronLeft size={16} color={colors.fg.accent.primary} />
                  <Text style={tourStyles.navBtnText}>Back</Text>
                </Pressable>
              )}
              <Pressable
                onPress={() => tourSystem.nextStep()}
                style={[tourStyles.navBtn, tourStyles.nextBtn]}
              >
                <Text style={tourStyles.nextBtnText}>
                  {state.currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
                </Text>
                {state.currentStep < totalSteps - 1 && (
                  <ChevronRight size={16} color={colors.fg.onAccent} />
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

function getTooltipPosition(
  position: string,
  targetRect: LayoutRectangle | null
): Record<string, any> {
  if (!targetRect) {
    return { alignSelf: 'center', marginTop: '40%' };
  }

  const gap = 16;
  switch (position) {
    case 'top':
      return { position: 'absolute', top: targetRect.y - 200 - gap, left: 24, right: 24 };
    case 'bottom':
      return { position: 'absolute', top: targetRect.y + targetRect.height + gap, left: 24, right: 24 };
    case 'left':
      return { position: 'absolute', top: targetRect.y, right: targetRect.x + targetRect.width };
    case 'right':
      return { position: 'absolute', top: targetRect.y, left: targetRect.x + targetRect.width + gap };
    default:
      return { alignSelf: 'center', marginTop: '40%' };
  }
}

const tourStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  tooltip: {
    backgroundColor: colors.bg.neutral.primary,
    borderRadius: borderRadius.lg,
    padding: spaceAround.default,
    marginHorizontal: 24,
    ...shadows.lg,
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spaceAround.compact,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
  },
  closeBtn: {
    padding: spaceAround.nudge4,
  },
  tooltipContent: {
    fontSize: 14,
    color: colors.fg.neutral.secondary,
    lineHeight: 22,
    marginBottom: spaceAround.default,
  },
  tooltipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepIndicator: {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
  },
  tooltipActions: {
    flexDirection: 'row',
    gap: spaceBetween.repeating,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spaceAround.tight,
    paddingHorizontal: spaceAround.compact,
    borderRadius: borderRadius.sm,
  },
  navBtnText: {
    fontSize: 14,
    color: colors.fg.accent.primary,
    fontWeight: typography.fontWeight.medium,
  },
  nextBtn: {
    backgroundColor: colors.bg.accent.primary,
    paddingHorizontal: spaceAround.default,
  },
  nextBtnText: {
    fontSize: 14,
    color: colors.fg.onAccent,
    fontWeight: typography.fontWeight.medium,
  },
});
```

### 3. CREATE `apps/ehr-prototype/src/tour/TourTargetRegistry.tsx`

> Provides a ref-based registry for tour target elements. Components register themselves with a testID, and the tour system can measure their layout without DOM queries.

```typescript
import React, { createContext, useContext, useRef, useCallback } from 'react';
import { LayoutRectangle, View, findNodeHandle } from 'react-native';

interface TourTargetRegistryValue {
  registerTarget: (testId: string, ref: React.RefObject<View>) => void;
  unregisterTarget: (testId: string) => void;
  measureTarget: (testId: string) => Promise<LayoutRectangle | null>;
}

const TourTargetContext = createContext<TourTargetRegistryValue | null>(null);

export const TourTargetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const targetsRef = useRef<Map<string, React.RefObject<View>>>(new Map());

  const registerTarget = useCallback((testId: string, ref: React.RefObject<View>) => {
    targetsRef.current.set(testId, ref);
  }, []);

  const unregisterTarget = useCallback((testId: string) => {
    targetsRef.current.delete(testId);
  }, []);

  const measureTarget = useCallback((testId: string): Promise<LayoutRectangle | null> => {
    return new Promise((resolve) => {
      const ref = targetsRef.current.get(testId);
      if (!ref?.current) {
        resolve(null);
        return;
      }

      ref.current.measureInWindow((x, y, width, height) => {
        resolve({ x, y, width, height });
      });
    });
  }, []);

  return (
    <TourTargetContext.Provider value={{ registerTarget, unregisterTarget, measureTarget }}>
      {children}
    </TourTargetContext.Provider>
  );
};

export function useTourTargets() {
  const context = useContext(TourTargetContext);
  if (!context) {
    throw new Error('useTourTargets must be used within TourTargetProvider');
  }
  return context;
}

/**
 * Hook for components to register as tour targets.
 * Usage: const ref = useTourTarget('my-testid');
 * Then: <View ref={ref} testID="my-testid">...</View>
 */
export function useTourTarget(testId: string): React.RefObject<View> {
  const ref = useRef<View>(null);
  const { registerTarget, unregisterTarget } = useTourTargets();

  React.useEffect(() => {
    registerTarget(testId, ref);
    return () => unregisterTarget(testId);
  }, [testId, registerTarget, unregisterTarget]);

  return ref;
}
```

### 4. CREATE `apps/ehr-prototype/src/tour/tours/onboarding.ts`
```typescript
import type { Tour } from '../TourSystem';

export const CAPTURE_BASICS_TOUR: Tour = {
  id: 'capture-basics',
  name: 'Capture Mode Basics',
  description: 'Learn the fundamentals of capturing clinical data',
  category: 'onboarding',
  steps: [
    {
      id: 'welcome',
      targetTestId: 'capture-view',
      title: 'Welcome to Capture Mode',
      content: 'This is where you document the patient encounter. Items appear chronologically as you add them.',
      position: 'bottom',
    },
    {
      id: 'patient-header',
      targetTestId: 'patient-header',
      title: 'Patient Information',
      content: 'Patient demographics, allergies, and key clinical info are always visible here.',
      position: 'bottom',
    },
    {
      id: 'care-gaps',
      targetTestId: 'care-gap-indicator',
      title: 'Care Gaps',
      content: 'This badge shows open care gaps. Tap to see what preventive care is due.',
      position: 'bottom',
    },
    {
      id: 'omni-add',
      targetTestId: 'omni-add-input',
      title: 'Add to Chart',
      content: 'Tap here (or press "A" on web) to add any item to the chart. Start typing to search.',
      position: 'top',
    },
    {
      id: 'transcription',
      targetTestId: 'transcription-toggle',
      title: 'Voice Recording',
      content: 'Tap to start ambient listening. AI will suggest items based on the conversation.',
      position: 'top',
    },
    {
      id: 'minibar',
      targetTestId: 'minibar',
      title: 'Status Bar',
      content: 'See transcription status, pending tasks, alerts, and sync status at a glance.',
      position: 'top',
    },
    {
      id: 'mode-selector',
      targetTestId: 'mode-selector',
      title: 'Workflow Modes',
      content: 'Switch between Capture (input), Process (review tasks), and Review (final check) modes.',
      position: 'bottom',
    },
  ],
};

export const AI_FEATURES_TOUR: Tour = {
  id: 'ai-features',
  name: 'AI-Powered Features',
  description: 'Discover how AI assists your workflow',
  category: 'feature',
  prerequisites: ['capture-basics'],
  steps: [
    {
      id: 'suggestions',
      targetTestId: 'suggestion-chip',
      title: 'AI Suggestions',
      content: 'When transcription detects clinical entities, they appear as suggestion chips. Tap to accept or dismiss.',
      position: 'top',
      waitForTestId: 'suggestion-chip',
    },
    {
      id: 'tasks',
      targetTestId: 'minibar-tasks',
      title: 'Background Tasks',
      content: 'AI runs tasks like diagnosis linking, drug interaction checks, and formulary lookups automatically.',
      position: 'top',
    },
    {
      id: 'palette',
      targetTestId: 'minibar-palette-btn',
      title: 'AI Palette',
      content: 'Tap to open the palette for more suggestions and alerts.',
      position: 'top',
    },
  ],
};

export const TASK_WORKFLOW_TOUR: Tour = {
  id: 'task-workflow',
  name: 'Task Management',
  description: 'Learn to efficiently process pending tasks',
  category: 'workflow',
  prerequisites: ['capture-basics'],
  steps: [
    {
      id: 'task-pane',
      targetTestId: 'task-pane',
      title: 'Task Pane',
      content: 'All AI-generated tasks are organized here by status. Review and approve before sending.',
      position: 'left',
    },
    {
      id: 'needs-review',
      targetTestId: 'task-section-needsReview',
      title: 'Needs Review',
      content: 'These tasks require your decision. Tap to see details and approve or reject.',
      position: 'left',
    },
    {
      id: 'batch-send',
      targetTestId: 'batch-send-btn',
      title: 'Batch Operations',
      content: 'Send all ready items to their destinations with one tap.',
      position: 'left',
    },
  ],
};

export const ALL_TOURS = [
  CAPTURE_BASICS_TOUR,
  AI_FEATURES_TOUR,
  TASK_WORKFLOW_TOUR,
];
```

## Guidelines
- Use ref-based element measurement via TourTargetRegistry (no DOM querySelector)
- Use React Native `Modal` for tour overlay (cross-platform)
- Track completion in AsyncStorage
- Support tour prerequisites
- Components can register as tour targets using the `useTourTarget` hook

---

## Chunk 6.6: Performance Optimization

### Prompt

Add performance optimizations for smooth demo experiences. Uses React Native-compatible patterns.

## Requirements

### 1. CREATE `apps/ehr-prototype/src/performance/memoization.ts`
```typescript
import type { EncounterState } from '../state/types';

// ============================================================================
// Selector Memoization
// ============================================================================

type Selector<T> = (state: EncounterState) => T;

export function createMemoizedSelector<T>(
  selector: Selector<T>,
  equalityFn: (a: T, b: T) => boolean = Object.is
): Selector<T> {
  let lastState: EncounterState | null = null;
  let lastResult: T | null = null;

  return (state: EncounterState): T => {
    if (lastState === state) {
      return lastResult as T;
    }

    const newResult = selector(state);

    if (lastResult !== null && equalityFn(lastResult, newResult)) {
      lastState = state;
      return lastResult;
    }

    lastState = state;
    lastResult = newResult;
    return newResult;
  };
}

// Shallow equality for arrays
export function shallowArrayEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}

// Shallow equality for objects
export function shallowObjectEqual<T extends object>(a: T, b: T): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(key => (a as any)[key] === (b as any)[key]);
}
```

### 2. CREATE `apps/ehr-prototype/src/performance/virtualization.tsx`

> Uses React Native's FlatList for virtualized rendering (not a custom VirtualList).

```typescript
import React, { useCallback } from 'react';
import { FlatList, FlatListProps, View, StyleSheet } from 'react-native';

// ============================================================================
// VirtualizedItemList
// ============================================================================

interface VirtualizedItemListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  estimatedItemHeight?: number;
  header?: React.ReactElement;
  footer?: React.ReactElement;
  emptyComponent?: React.ReactElement;
  onEndReached?: () => void;
}

export function VirtualizedItemList<T>({
  items,
  renderItem,
  keyExtractor,
  estimatedItemHeight = 80,
  header,
  footer,
  emptyComponent,
  onEndReached,
}: VirtualizedItemListProps<T>) {
  const renderFlatListItem = useCallback(
    ({ item, index }: { item: T; index: number }) => renderItem(item, index),
    [renderItem]
  );

  return (
    <FlatList
      data={items}
      renderItem={renderFlatListItem}
      keyExtractor={keyExtractor}
      getItemLayout={(_, index) => ({
        length: estimatedItemHeight,
        offset: estimatedItemHeight * index,
        index,
      })}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      ListEmptyComponent={emptyComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={8}
    />
  );
}

// ============================================================================
// Hook for FlatList optimization
// ============================================================================

export function useOptimizedList<T>(
  items: T[],
  options: {
    keyField: keyof T;
    estimatedItemHeight?: number;
  }
) {
  const keyExtractor = useCallback(
    (item: T) => String(item[options.keyField]),
    [options.keyField]
  );

  const getItemLayout = useCallback(
    (_: T[] | null | undefined, index: number) => ({
      length: options.estimatedItemHeight || 80,
      offset: (options.estimatedItemHeight || 80) * index,
      index,
    }),
    [options.estimatedItemHeight]
  );

  return { keyExtractor, getItemLayout };
}
```

### 3. CREATE `apps/ehr-prototype/src/performance/lazy-loading.ts`
```typescript
import React, { Suspense, lazy } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../styles/foundations';

// ============================================================================
// Lazy Screen Components
// ============================================================================

export const LazyCaptureView = lazy(() =>
  import('../screens/CaptureView').then(m => ({ default: m.CaptureView || m.default }))
);

export const LazyProcessView = lazy(() =>
  import('../screens/ProcessView').then(m => ({ default: m.ProcessView || m.default }))
);

export const LazyReviewView = lazy(() =>
  import('../screens/ReviewView').then(m => ({ default: m.ReviewView || m.default }))
);

// ============================================================================
// Loading Fallback
// ============================================================================

export const ScreenLoadingFallback: React.FC = () => (
  <View style={loadingStyles.container}>
    <ActivityIndicator size="large" color={colors.fg.accent.primary} />
  </View>
);

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.neutral.min,
  },
});

// ============================================================================
// Preload utility
// ============================================================================

export function preloadScreen(screen: 'capture' | 'process' | 'review') {
  switch (screen) {
    case 'capture':
      import('../screens/CaptureView');
      break;
    case 'process':
      import('../screens/ProcessView');
      break;
    case 'review':
      import('../screens/ReviewView');
      break;
  }
}
```

### 4. CREATE `apps/ehr-prototype/src/performance/debounce.ts`
```typescript
import { useRef, useCallback, useEffect, useState } from 'react';

// ============================================================================
// Debounce
// ============================================================================

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// ============================================================================
// Throttle
// ============================================================================

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================================================
// Hooks
// ============================================================================

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    debounce((...args: Parameters<T>) => callbackRef.current(...args), delay),
    [delay]
  );
}

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    throttle((...args: Parameters<T>) => callbackRef.current(...args), limit),
    [limit]
  );
}

/**
 * requestAnimationFrame-based throttle for smooth animations.
 * Falls back to setTimeout on platforms without rAF.
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;

  return (...args: Parameters<T>) => {
    if (rafId !== null) return;

    rafId = requestAnimationFrame(() => {
      fn(...args);
      rafId = null;
    });
  };
}
```

## Guidelines
- Memoize expensive selectors
- Use FlatList for virtualized rendering (React Native built-in)
- Lazy load screen components with React.lazy + Suspense
- Debounce/throttle event handlers
- Use `removeClippedSubviews` and `windowSize` for FlatList optimization

---

## Chunk 6.7: Error Boundaries & Recovery

### Prompt

Extend the existing ErrorBoundary with recovery mechanisms and network handling. The base ErrorBoundary already exists at `src/components/ErrorBoundary.tsx`.

## Requirements

### 1. CREATE `apps/ehr-prototype/src/errors/RecoveryManager.ts`

> Uses AsyncStorage instead of localStorage for React Native compatibility.

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { EncounterState } from '../state/types';

// ============================================================================
// Types
// ============================================================================

interface RecoverySnapshot {
  state: EncounterState;
  timestamp: number;
  trigger: string;
}

interface RecoveryManagerConfig {
  getState: () => EncounterState;
  restoreState: (state: EncounterState) => void;
  maxSnapshots?: number;
  autoSaveInterval?: number;
}

// ============================================================================
// RecoveryManager
// ============================================================================

const STORAGE_KEY = 'ehr-recovery-snapshots';

export class RecoveryManager {
  private config: RecoveryManagerConfig;
  private snapshots: RecoverySnapshot[] = [];
  private autoSaveTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: RecoveryManagerConfig) {
    this.config = {
      maxSnapshots: 10,
      autoSaveInterval: 30000,
      ...config,
    };

    this.loadFromStorage();
    this.startAutoSave();
  }

  // Save current state
  saveSnapshot(trigger: string = 'manual') {
    const state = this.config.getState();
    const snapshot: RecoverySnapshot = {
      state: JSON.parse(JSON.stringify(state)),
      timestamp: Date.now(),
      trigger,
    };

    this.snapshots.push(snapshot);

    if (this.snapshots.length > (this.config.maxSnapshots || 10)) {
      this.snapshots.shift();
    }

    this.persistToStorage();
  }

  getSnapshots(): RecoverySnapshot[] {
    return [...this.snapshots];
  }

  restoreSnapshot(index: number): boolean {
    const snapshot = this.snapshots[index];
    if (!snapshot) return false;

    this.config.restoreState(snapshot.state);
    return true;
  }

  restoreLatest(): boolean {
    if (this.snapshots.length === 0) return false;
    return this.restoreSnapshot(this.snapshots.length - 1);
  }

  clearSnapshots() {
    this.snapshots = [];
    AsyncStorage.removeItem(STORAGE_KEY);
  }

  destroy() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
  }

  // Private
  private startAutoSave() {
    this.autoSaveTimer = setInterval(() => {
      this.saveSnapshot('auto');
    }, this.config.autoSaveInterval);
  }

  private async persistToStorage() {
    try {
      const toSave = this.snapshots.slice(-3);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to persist recovery snapshots:', e);
    }
  }

  private async loadFromStorage() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.snapshots = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load recovery snapshots:', e);
    }
  }
}
```

### 2. CREATE `apps/ehr-prototype/src/errors/NetworkStatusBanner.tsx`

> Uses `@react-native-community/netinfo` for cross-platform network detection.

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { WifiOff, RefreshCw } from 'lucide-react';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../styles/foundations';

export const NetworkStatusBanner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const opacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? true;

      if (!connected && isConnected) {
        // Went offline
        setIsConnected(false);
        setShowBanner(true);
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      } else if (connected && !isConnected) {
        // Came back online
        setIsConnected(true);
        // Show "reconnected" briefly
        setTimeout(() => {
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
            setShowBanner(false);
          });
        }, 3000);
      }
    });

    return unsubscribe;
  }, [isConnected]);

  return (
    <View style={{ flex: 1 }}>
      {showBanner && (
        <Animated.View style={[bannerStyles.banner, { opacity }, !isConnected && bannerStyles.offline]}>
          {isConnected ? (
            <Text style={bannerStyles.text}>Connection restored</Text>
          ) : (
            <View style={bannerStyles.row}>
              <WifiOff size={14} color={colors.fg.onAccent} />
              <Text style={bannerStyles.text}>Offline. Changes will sync when reconnected.</Text>
            </View>
          )}
        </Animated.View>
      )}
      {children}
    </View>
  );
};

const bannerStyles = StyleSheet.create({
  banner: {
    backgroundColor: colors.bg.success.primary,
    paddingVertical: spaceAround.tight,
    paddingHorizontal: spaceAround.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offline: {
    backgroundColor: colors.bg.danger.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  },
  text: {
    fontSize: 13,
    color: colors.fg.onAccent,
    fontWeight: typography.fontWeight.medium,
  },
});
```

### 3. CREATE `apps/ehr-prototype/src/errors/useRecovery.ts`
```typescript
import { useRef, useEffect } from 'react';
import { RecoveryManager } from './RecoveryManager';
import { useEncounterContext } from '../context/EncounterContext';

export function useRecovery() {
  const { state, dispatch } = useEncounterContext();
  const managerRef = useRef<RecoveryManager | null>(null);

  if (!managerRef.current) {
    managerRef.current = new RecoveryManager({
      getState: () => state,
      restoreState: (restoredState) => {
        dispatch({ type: 'STATE_RESTORED', payload: { state: restoredState } });
      },
    });
  }

  useEffect(() => {
    return () => managerRef.current?.destroy();
  }, []);

  return {
    saveSnapshot: (trigger?: string) => managerRef.current?.saveSnapshot(trigger),
    restoreLatest: () => managerRef.current?.restoreLatest(),
    getSnapshots: () => managerRef.current?.getSnapshots() || [],
    clearSnapshots: () => managerRef.current?.clearSnapshots(),
  };
}
```

## Guidelines
- Extend existing ErrorBoundary (don't replace it)
- Use AsyncStorage for persistence (React Native compatible)
- Use @react-native-community/netinfo for network detection
- Support auto-save with configurable intervals
- Recovery restores state via dispatch

---

## Chunk 6.8: Keyboard Shortcuts System (Web)

### Prompt

Create a keyboard shortcuts system for web users (Expo Web). This only applies to the web platform; native users interact via touch.

## Requirements

### 1. CREATE `apps/ehr-prototype/src/shortcuts/ShortcutManager.ts`

> Platform-guarded: only registers event listeners when running on web (`Platform.OS === 'web'`).

```typescript
import { Platform } from 'react-native';

type ShortcutHandler = () => void;
type KeyCombo = string;

export interface Shortcut {
  id: string;
  key: KeyCombo;
  description: string;
  category: 'navigation' | 'editing' | 'actions' | 'ai';
  handler: ShortcutHandler;
  when?: () => boolean;
}

export class ShortcutManager {
  private shortcuts: Map<string, Shortcut> = new Map();
  private keyMap: Map<string, string> = new Map();
  private enabled: boolean = true;

  constructor() {
    if (Platform.OS === 'web') {
      this.handleKeyDown = this.handleKeyDown.bind(this);
      document.addEventListener('keydown', this.handleKeyDown);
    }
  }

  register(shortcut: Shortcut) {
    this.shortcuts.set(shortcut.id, shortcut);
    this.keyMap.set(this.normalizeKey(shortcut.key), shortcut.id);
  }

  unregister(id: string) {
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      this.keyMap.delete(this.normalizeKey(shortcut.key));
      this.shortcuts.delete(id);
    }
  }

  enable() { this.enabled = true; }
  disable() { this.enabled = false; }

  getAll(): Shortcut[] {
    return Array.from(this.shortcuts.values());
  }

  getByCategory(category: Shortcut['category']): Shortcut[] {
    return this.getAll().filter(s => s.category === category);
  }

  destroy() {
    if (Platform.OS === 'web') {
      document.removeEventListener('keydown', this.handleKeyDown);
    }
    this.shortcuts.clear();
    this.keyMap.clear();
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (!this.enabled) return;

    // Ignore if typing in input/textarea
    const target = event.target as HTMLElement;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
      if (!this.isGlobalShortcut(event)) return;
    }

    const keyCombo = this.eventToKeyCombo(event);
    const shortcutId = this.keyMap.get(keyCombo);

    if (shortcutId) {
      const shortcut = this.shortcuts.get(shortcutId);
      if (shortcut) {
        if (shortcut.when && !shortcut.when()) return;
        event.preventDefault();
        shortcut.handler();
      }
    }
  }

  private eventToKeyCombo(event: KeyboardEvent): string {
    const parts: string[] = [];
    if (event.ctrlKey || event.metaKey) parts.push('mod');
    if (event.shiftKey) parts.push('shift');
    if (event.altKey) parts.push('alt');

    const key = event.key.toLowerCase();
    if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
      parts.push(key);
    }

    return parts.join('+');
  }

  private normalizeKey(key: KeyCombo): string {
    return key.toLowerCase().replace('ctrl', 'mod').replace('cmd', 'mod').replace('command', 'mod');
  }

  private isGlobalShortcut(event: KeyboardEvent): boolean {
    if (event.key === 'Escape') return true;
    if (event.ctrlKey || event.metaKey) return true;
    return false;
  }
}

export const shortcutManager = new ShortcutManager();
```

### 2. CREATE `apps/ehr-prototype/src/shortcuts/defaultShortcuts.ts`
```typescript
import { shortcutManager, Shortcut } from './ShortcutManager';

export function registerDefaultShortcuts(actions: {
  openOmniAdd: () => void;
  toggleTranscription: () => void;
  switchMode: (mode: string) => void;
  openPalette: () => void;
  save: () => void;
  help: () => void;
}) {
  const shortcuts: Shortcut[] = [
    // Navigation
    { id: 'mode-capture', key: '1', description: 'Switch to Capture mode', category: 'navigation', handler: () => actions.switchMode('capture') },
    { id: 'mode-process', key: '2', description: 'Switch to Process mode', category: 'navigation', handler: () => actions.switchMode('process') },
    { id: 'mode-review', key: '3', description: 'Switch to Review mode', category: 'navigation', handler: () => actions.switchMode('review') },

    // Editing
    { id: 'omni-add', key: 'a', description: 'Open Add to Chart', category: 'editing', handler: actions.openOmniAdd },
    { id: 'save', key: 'mod+s', description: 'Save encounter', category: 'editing', handler: actions.save },

    // Actions
    { id: 'transcription', key: 't', description: 'Toggle transcription', category: 'actions', handler: actions.toggleTranscription },
    { id: 'search', key: 'mod+k', description: 'Search', category: 'actions', handler: actions.openOmniAdd },

    // AI
    { id: 'palette', key: 'p', description: 'Open AI Palette', category: 'ai', handler: actions.openPalette },

    // Help
    { id: 'help', key: '?', description: 'Show keyboard shortcuts', category: 'navigation', handler: actions.help },
  ];

  shortcuts.forEach(s => shortcutManager.register(s));
  return () => shortcuts.forEach(s => shortcutManager.unregister(s.id));
}
```

### 3. CREATE `apps/ehr-prototype/src/shortcuts/ShortcutHelpModal.tsx`
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { Modal } from '../components/primitives/Modal';
import { shortcutManager, Shortcut } from './ShortcutManager';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../styles/foundations';

interface ShortcutHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutHelpModal: React.FC<ShortcutHelpModalProps> = ({ isOpen, onClose }) => {
  const shortcuts = shortcutManager.getAll();

  const categories = [
    { id: 'navigation', label: 'Navigation' },
    { id: 'editing', label: 'Editing' },
    { id: 'actions', label: 'Actions' },
    { id: 'ai', label: 'AI Features' },
  ] as const;

  const isMac = Platform.OS === 'web' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '\u2318' : 'Ctrl';

  const formatKey = (key: string): string => {
    return key
      .replace('mod', modKey)
      .replace('shift', '\u21E7')
      .replace('alt', isMac ? '\u2325' : 'Alt')
      .replace('+', ' + ')
      .toUpperCase();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts">
      <ScrollView style={helpStyles.container}>
        {categories.map(category => {
          const categoryShortcuts = shortcuts.filter(s => s.category === category.id);
          if (categoryShortcuts.length === 0) return null;

          return (
            <View key={category.id} style={helpStyles.category}>
              <Text style={helpStyles.categoryLabel}>{category.label}</Text>
              {categoryShortcuts.map(shortcut => (
                <View key={shortcut.id} style={helpStyles.shortcutRow}>
                  <Text style={helpStyles.description}>{shortcut.description}</Text>
                  <View style={helpStyles.keyBadge}>
                    <Text style={helpStyles.keyText}>{formatKey(shortcut.key)}</Text>
                  </View>
                </View>
              ))}
            </View>
          );
        })}

        <Text style={helpStyles.footer}>Press ? anytime to show this help</Text>
      </ScrollView>
    </Modal>
  );
};

const helpStyles = StyleSheet.create({
  container: {
    maxHeight: 400,
  },
  category: {
    marginBottom: spaceAround.default,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.spotReadable,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spaceAround.compact,
  },
  shortcutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spaceAround.tight,
  },
  description: {
    fontSize: 14,
    color: colors.fg.neutral.primary,
  },
  keyBadge: {
    backgroundColor: colors.bg.neutral.subtle,
    paddingVertical: 2,
    paddingHorizontal: spaceAround.tight,
    borderRadius: borderRadius.xs,
  },
  keyText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
    color: colors.fg.neutral.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
    marginTop: spaceAround.default,
  },
});
```

## Guidelines
- Guard with `Platform.OS === 'web'` (no keyboard on native)
- Support both Mac and Windows key conventions
- Disable shortcuts when typing in inputs
- Provide discoverable help modal

---

## Chunk 6.9: Demo Presets & Enhanced Launcher

### Prompt

Enhance the existing DemoLauncher (`src/navigation/DemoLauncher.tsx`) with preset configurations for different presentation scenarios and feature toggles.

## Requirements

### 1. CREATE `apps/ehr-prototype/src/demo/presets.ts`
```typescript
export interface DemoFeatures {
  transcription: boolean;
  aiSuggestions: boolean;
  careGaps: boolean;
  taskPane: boolean;
  noteGeneration: boolean;
}

export interface DemoPreset {
  id: string;
  name: string;
  description: string;
  category: 'clinical' | 'feature' | 'workflow';
  duration: string;
  highlights: string[];
  scenario: string;
  features: DemoFeatures;
  tours?: string[];
  autoStart?: boolean;
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'uc-quick',
    name: 'Urgent Care Quick Demo',
    description: 'See a complete urgent care visit in action',
    category: 'clinical',
    duration: '5 min',
    highlights: [
      'Ambient listening captures visit',
      'AI suggests diagnoses and medications',
      'Quick order entry with smart defaults',
      'Automatic note generation',
    ],
    scenario: 'demo-uc',
    features: {
      transcription: true,
      aiSuggestions: true,
      careGaps: false,
      taskPane: true,
      noteGeneration: true,
    },
    autoStart: true,
  },
  {
    id: 'pc-comprehensive',
    name: 'Primary Care with Care Gaps',
    description: 'Chronic disease management with quality measure tracking',
    category: 'clinical',
    duration: '10 min',
    highlights: [
      'Care gaps displayed on patient entry',
      'Order directly from gap cards',
      'Automatic gap closure tracking',
      'Quality measure reporting',
    ],
    scenario: 'demo-pc',
    features: {
      transcription: true,
      aiSuggestions: true,
      careGaps: true,
      taskPane: true,
      noteGeneration: true,
    },
    tours: ['capture-basics'],
  },
  {
    id: 'ai-features',
    name: 'AI Features Showcase',
    description: 'Deep dive into AI-powered capabilities',
    category: 'feature',
    duration: '8 min',
    highlights: [
      'Real-time entity extraction',
      'Diagnosis association suggestions',
      'Drug interaction checking',
      'Contextual note generation',
    ],
    scenario: 'demo-uc',
    features: {
      transcription: true,
      aiSuggestions: true,
      careGaps: false,
      taskPane: true,
      noteGeneration: true,
    },
    tours: ['ai-features'],
  },
  {
    id: 'workflow-modes',
    name: 'Three-Mode Workflow',
    description: 'Experience the Capture, Process, Review flow',
    category: 'workflow',
    duration: '7 min',
    highlights: [
      'Capture mode for fast input',
      'Process mode for batch review',
      'Review mode for final check',
    ],
    scenario: 'demo-uc',
    features: {
      transcription: true,
      aiSuggestions: true,
      careGaps: false,
      taskPane: true,
      noteGeneration: true,
    },
    tours: ['capture-basics', 'task-workflow'],
  },
  {
    id: 'minimal',
    name: 'Basic Charting',
    description: 'Simple charting without AI features',
    category: 'workflow',
    duration: '3 min',
    highlights: [
      'Clean OmniAdd interface',
      'Quick item entry',
      'Manual workflow control',
    ],
    scenario: 'demo-uc',
    features: {
      transcription: false,
      aiSuggestions: false,
      careGaps: false,
      taskPane: false,
      noteGeneration: false,
    },
  },
];

export function getPresetById(id: string): DemoPreset | undefined {
  return DEMO_PRESETS.find(p => p.id === id);
}

export function getPresetsByCategory(category: DemoPreset['category']): DemoPreset[] {
  return DEMO_PRESETS.filter(p => p.category === category);
}
```

### 2. CREATE `apps/ehr-prototype/src/demo/DemoModeBanner.tsx`
```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { X, RotateCcw, Settings } from 'lucide-react';
import { DemoPreset } from './presets';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../styles/foundations';

interface DemoModeBannerProps {
  preset: DemoPreset;
  onExit: () => void;
  onReset: () => void;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({
  preset,
  onExit,
  onReset,
}) => {
  return (
    <View style={bannerStyles.container} testID="demo-mode-banner">
      <View style={bannerStyles.info}>
        <View style={bannerStyles.label}>
          <Text style={bannerStyles.labelText}>Demo</Text>
        </View>
        <Text style={bannerStyles.name}>{preset.name}</Text>
      </View>

      <View style={bannerStyles.actions}>
        <Pressable onPress={onReset} style={bannerStyles.actionBtn}>
          <RotateCcw size={14} color="rgba(255,255,255,0.9)" />
        </Pressable>
        <Pressable onPress={onExit} style={bannerStyles.actionBtn}>
          <X size={14} color="rgba(255,255,255,0.9)" />
        </Pressable>
      </View>
    </View>
  );
};

const bannerStyles = StyleSheet.create({
  container: {
    height: 32,
    backgroundColor: colors.bg.accent.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spaceAround.default,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  },
  label: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: borderRadius.xs,
  },
  labelText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.onAccent,
  },
  name: {
    fontSize: 13,
    color: colors.fg.onAccent,
    fontWeight: typography.fontWeight.medium,
  },
  actions: {
    flexDirection: 'row',
    gap: spaceBetween.repeating,
  },
  actionBtn: {
    padding: 4,
    borderRadius: borderRadius.xs,
  },
});
```

### 3. CREATE `apps/ehr-prototype/src/demo/DemoContext.tsx`

> Provides demo state (active preset, features) to the entire app tree.

```typescript
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { DemoPreset, DemoFeatures, getPresetById } from './presets';

interface DemoContextValue {
  activePreset: DemoPreset | null;
  features: DemoFeatures;
  isDemoMode: boolean;
  launchPreset: (presetId: string) => void;
  exitDemo: () => void;
  resetDemo: () => void;
}

const DEFAULT_FEATURES: DemoFeatures = {
  transcription: true,
  aiSuggestions: true,
  careGaps: true,
  taskPane: true,
  noteGeneration: true,
};

const DemoContext = createContext<DemoContextValue | null>(null);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePreset, setActivePreset] = useState<DemoPreset | null>(null);

  const launchPreset = useCallback((presetId: string) => {
    const preset = getPresetById(presetId);
    if (preset) setActivePreset(preset);
  }, []);

  const exitDemo = useCallback(() => {
    setActivePreset(null);
  }, []);

  const resetDemo = useCallback(() => {
    // Re-launch same preset (resets state)
    if (activePreset) {
      setActivePreset({ ...activePreset });
    }
  }, [activePreset]);

  const value = useMemo<DemoContextValue>(() => ({
    activePreset,
    features: activePreset?.features || DEFAULT_FEATURES,
    isDemoMode: !!activePreset,
    launchPreset,
    exitDemo,
    resetDemo,
  }), [activePreset, launchPreset, exitDemo, resetDemo]);

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
};

export function useDemoMode(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoMode must be used within DemoProvider');
  }
  return context;
}
```

### 4. UPDATE existing `apps/ehr-prototype/src/navigation/DemoLauncher.tsx`

Add a "Demo Presets" section below the existing scenario cards that shows the enhanced preset options:

```typescript
// Add import at top:
import { DEMO_PRESETS, DemoPreset } from '../demo/presets';
import { useDemoMode } from '../demo/DemoContext';
import { Clock, CheckCircle } from 'lucide-react';

// Add PresetSection component and render it after the scenarioGrid div
```

> The existing DemoLauncher already works well. Add a `PresetSection` that shows the DEMO_PRESETS below the existing scenario cards. When a preset is selected, call `useDemoMode().launchPreset(preset.id)` then `navigateToEncounter(preset.scenario, 'capture')`.

## Guidelines
- Extend existing DemoLauncher (don't replace it)
- Use DemoContext to propagate feature flags to AI services and UI components
- DemoModeBanner appears at the top when a preset is active
- Feature flags should gate transcription, suggestions, care gaps, etc.

---

## Chunk 6.10: Final Integration & Polish

### Prompt

Integrate all demo and test features into the main application. Wire up the DemoProvider, TourTargetProvider, NetworkStatusBanner, and keyboard shortcuts into the existing App/provider structure.

## Requirements

### 1. UPDATE `apps/ehr-prototype/src/context/AppProviders.tsx`

Add the new providers in the correct order:

```typescript
// Add imports:
import { DemoProvider } from '../demo/DemoContext';
import { TourTargetProvider } from '../tour/TourTargetRegistry';
import { NetworkStatusBanner } from '../errors/NetworkStatusBanner';

// Update the component to wrap with new providers:
// ThemeProvider > DemoProvider > EncounterProvider > AIServicesProvider > TranscriptionProvider > TourTargetProvider > NetworkStatusBanner > children
```

The `DemoProvider` goes outside `EncounterProvider` so demo presets can configure initial state. The `TourTargetProvider` wraps the rendered content so components can register as tour targets.

### 2. UPDATE `apps/ehr-prototype/src/App.tsx`

Wire up the TourOverlay, ShortcutHelpModal, and DemoModeBanner:

```typescript
import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProviders } from './context/AppProviders';
import { NavigationProvider } from './navigation/NavigationContext';
import { AppRouter } from './navigation/AppRouter';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TourOverlay } from './tour/TourOverlay';
import { DemoModeBanner } from './demo/DemoModeBanner';
import { DemoOverlay } from './demo/DemoOverlay';
import { ShortcutHelpModal } from './shortcuts/ShortcutHelpModal';
import { registerDefaultShortcuts } from './shortcuts/defaultShortcuts';
import { useDemoMode } from './demo/DemoContext';
import { useDemoController } from './demo/hooks/useDemoController';
import { useNavigation } from './navigation/NavigationContext';
import { tourSystem } from './tour/TourSystem';
import { ALL_TOURS } from './tour/tours/onboarding';

// Register tours
tourSystem.registerTours(ALL_TOURS);

export const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <AppProviders>
            <NavigationProvider>
              <AppContent />
            </NavigationProvider>
          </AppProviders>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const AppContent: React.FC = () => {
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const { activePreset, exitDemo, resetDemo } = useDemoMode();
  const { setMode } = useNavigation();

  // Register keyboard shortcuts (web only)
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    return registerDefaultShortcuts({
      openOmniAdd: () => {/* dispatch custom event or use ref */},
      toggleTranscription: () => {/* dispatch custom event */},
      switchMode: (mode) => setMode(mode as any),
      openPalette: () => {/* dispatch custom event */},
      save: () => {/* trigger save */},
      help: () => setShowShortcutHelp(true),
    });
  }, [setMode]);

  return (
    <>
      {/* Demo mode banner */}
      {activePreset && (
        <DemoModeBanner
          preset={activePreset}
          onExit={exitDemo}
          onReset={resetDemo}
        />
      )}

      {/* Main app */}
      <AppRouter />

      {/* Overlays */}
      <TourOverlay />
      {activePreset && <DemoOverlayContainer />}

      {/* Shortcut help (web only) */}
      {Platform.OS === 'web' && (
        <ShortcutHelpModal
          isOpen={showShortcutHelp}
          onClose={() => setShowShortcutHelp(false)}
        />
      )}
    </>
  );
};

const DemoOverlayContainer: React.FC = () => {
  const { controller, state } = useDemoController({ autoInitialize: true });

  if (!controller || !state?.currentScenarioId) return null;

  return <DemoOverlay controller={controller} />;
};

export default App;
```

### 3. UPDATE `apps/ehr-prototype/package.json`

Ensure all new dependencies are listed and scripts are complete:

```json
{
  "scripts": {
    "start": "expo start",
    "web": "expo start --web",
    "test": "jest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "type-check": "tsc --noEmit",
    "storybook": "storybook dev -p 6006"
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "^2.1.0",
    "@react-native-community/netinfo": "^11.4.0"
  }
}
```

> Note: Only add the dependencies that don't already exist. Check package.json before adding.

## Guidelines
- Integrate without conflicts with existing providers
- Maintain clean separation of concerns
- Guard web-only features with `Platform.OS === 'web'`
- All features should be accessible from both DemoLauncher (presets) and regular encounter flow
- Keep existing ErrorBoundary, DemoLauncher, and navigation patterns intact

---

## Execution Order

1. **6.1** Playwright Setup → E2E testing infrastructure
2. **6.2** Capture E2E Tests → Test primary workflow
3. **6.3** Task & Care Gap Tests → Test AI features
4. **6.4** Demo Controller → Scenario playback engine
5. **6.5** Guided Tours → User onboarding system
6. **6.6** Performance → Optimization utilities
7. **6.7** Error Handling → Recovery mechanisms
8. **6.8** Keyboard Shortcuts → Power user features (web)
9. **6.9** Demo Presets → Presentation configurations
10. **6.10** Final Integration → Tie everything together

---

## Verification Checklist

After completing Phase 6:

- [ ] `npm run test:e2e` passes against Expo Web build
- [ ] Demo launcher loads with preset options
- [ ] Scenario playback works with DemoOverlay controls
- [ ] Guided tours complete successfully on web
- [ ] Keyboard shortcuts function correctly (web only)
- [ ] ErrorBoundary catches and displays errors
- [ ] Recovery snapshots save/restore via AsyncStorage
- [ ] Network status banner appears when offline
- [ ] Performance is smooth during demos (FlatList virtualization, memoized selectors)
- [ ] All features gated by DemoFeatures flags

---

## New Dependencies

| Package | Purpose |
|---------|---------|
| `@playwright/test` (dev) | E2E testing on Expo Web |
| `@react-native-async-storage/async-storage` | Persistent storage for tours, recovery |
| `@react-native-community/netinfo` | Network status detection |

---

## Key Differences from Web-Only Approach

| Concern | This Implementation |
|---------|-------------------|
| Routing | NavigationContext (stack-based), navigate via UI interactions |
| Styling | `StyleSheet.create()` + design token foundations |
| Overlays | React Native `Modal` component |
| Storage | `AsyncStorage` (cross-platform) |
| Element measurement | Ref-based `measureInWindow()` via TourTargetRegistry |
| Keyboard shortcuts | Platform-guarded (`Platform.OS === 'web'`) |
| Virtualization | React Native `FlatList` with optimization props |
| E2E tests | Playwright targeting Expo Web (`testID` → `data-testid`) |

---

## Component Reuse & Design Token Guidelines

### Existing Primitives to Use

All Phase 6 UI should compose from existing primitives in `src/components/primitives/`:

| Primitive | Use For |
|-----------|---------|
| `Button` | All interactive buttons (variants: primary, secondary, ghost, danger) |
| `IconButton` | Icon-only controls (demo playback, tour close, banner actions) |
| `Card` | Container for tour tooltips, preset cards, demo controls |
| `Badge` | Feature flags display, step indicators, duration labels |
| `StatusBadge` | Demo status indicators (running, paused, completed) |
| `Modal` | Tour overlay, shortcut help, confirmation dialogs |
| `Spinner` | Loading states in lazy-loaded screens |
| `EmptyState` | No-tours-available, no-presets state |
| `SectionTitle` | Category headers in shortcut help, tour launcher |
| `CollapsibleGroup` | Expandable shortcut categories |
| `ListItemRow` | Tour list items, preset list in compact view |
| `Pill` | Tour step indicators, speed selector chips |
| `Tag` | Feature tags on preset cards |
| `ActionGroup` | Grouped demo control buttons |
| `Input` | Search/filter in tour launcher or preset selector |

### Design Token Foundations

All styling MUST use tokens from `src/styles/foundations/`:

```typescript
import {
  colors,         // Semantic colors: colors.bg.*, colors.fg.*, colors.border.*
  spaceAround,    // Padding/margins: spaceAround.tight, .compact, .default, .generous
  spaceBetween,   // Gaps: spaceBetween.repeating, .separatedSm
  borderRadius,   // Radii: borderRadius.xs, .sm, .md, .lg, .full
  typography,     // Font weights: typography.fontWeight.medium, .semibold, .bold
  shadows,        // Elevation: shadows.sm, .md, .lg
  zIndex,         // Layering: zIndex.modal, .overlay, .tooltip
  transitions,    // Animation timing: transitions.fast, .normal, .slow
} from '../styles/foundations';
```

**Do NOT use:**
- Raw hex colors (`#4F46E5`) — use `colors.bg.accent.primary`
- Raw numbers for spacing (`16`) — use `spaceAround.default`
- CSS variables (`var(--color-*)`) — this is React Native, not CSS

### Component Extraction Opportunities

The following new primitives should be extracted during Phase 6 implementation:

| Component | Source | Reuse Potential |
|-----------|--------|----------------|
| `ProgressBar` | DemoOverlay progress track | Care gap progress, task completion, upload progress |
| `StepIndicator` | Tour "1 of 7" dots/counter | Multi-step forms, onboarding flows |
| `SpotlightOverlay` | Tour spotlight mask | Feature callouts, first-run highlights |
| `FloatingPanel` | DemoOverlay bottom panel | Persistent controls, mini-player patterns |
| `KeyboardKey` | ShortcutHelp kbd display | Anywhere keyboard shortcuts are referenced |
| `BannerNotification` | NetworkStatusBanner, DemoModeBanner | System messages, update prompts |
| `PresetCard` | DemoLauncher preset grid | Reusable for scenario selection, template pickers |

**Extraction criteria**: If a pattern appears in 2+ chunks or has clear reuse outside Phase 6, extract it to `src/components/primitives/`.

### Existing Higher-Level Components to Leverage

| Component | Location | Relevant Phase 6 Use |
|-----------|----------|---------------------|
| `AlertCard` | `src/components/ai-ui/` | Drug interaction alerts in E2E tests |
| `Minibar` | `src/components/ai-ui/` | Status indicators, tour targets |
| `Palette` | `src/components/ai-ui/` | AI palette tour step |
| `TaskCard` | `src/components/tasks/` | Task management E2E tests |
| `CareGapCard` | `src/components/care-gaps/` | Care gap E2E tests |
| `SuggestionChip` | `src/components/suggestions/` | Suggestion E2E tests |
| `ModeSelector` | `src/components/layout/` | Mode switching E2E tests, tour target |
| `AppShell` | `src/components/layout/` | Overall layout wrapper |
| `PatientHeader` | `src/components/layout/` | Tour target |

---

## Phased Execution Plan (Testable Chunks)

### Phase 6A: Testing Infrastructure (Chunks 6.1)

**Goal**: Get Playwright running against Expo Web.

**Steps**:
1. Install `@playwright/test` and chromium
2. Create `playwright.config.ts` targeting `expo start --web`
3. Create test fixtures (page object models)
4. Create mock-api helpers
5. Write one smoke test proving the setup works

**Verification**:
```bash
npx expo start --web --port 8081 &
npx playwright test --grep "smoke"
```
- [ ] Expo Web starts and is reachable at `:8081`
- [ ] Playwright can load the page
- [ ] `data-testid` attributes are visible on rendered elements
- [ ] Smoke test passes (DemoLauncher renders, scenario card clickable)

---

### Phase 6B: Core E2E Tests (Chunks 6.2–6.3)

**Goal**: E2E coverage of the three encounter modes.

**Steps**:
1. Add `testID` props to any components missing them (audit existing components)
2. Create Capture flow tests (item creation, suggestions, transcription)
3. Create mode-switching tests
4. Create Task management tests
5. Create Care Gap workflow tests
6. Create AI service integration tests
7. Create Review/sign-off tests

**Verification**:
```bash
npm run test:e2e
```
- [ ] All capture tests pass (OmniAdd, suggestions, transcription toggle)
- [ ] Mode switching works (Capture → Process → Review)
- [ ] Task lifecycle tests pass (inject → select → approve)
- [ ] Care gap tests pass (open → action → status change)
- [ ] Sign-off workflow tests pass

**Prerequisite**: Phase 6A complete.

---

### Phase 6C: Demo Playback Engine (Chunk 6.4)

**Goal**: Scenario playback with step/play/pause controls.

**Steps**:
1. Create `DemoController.ts` (pure logic, no UI)
2. Create `DemoOverlay.tsx` (React Native UI)
3. Create `useDemoController` hook
4. Wire to existing scenario definitions in `src/scenarios/`
5. Extract `ProgressBar` primitive

**Verification**:
- [ ] Unit test: DemoController can load, play, pause, step, stop
- [ ] Unit test: Speed multiplier affects delay
- [ ] Storybook: DemoOverlay renders with mock state
- [ ] Integration: Overlay appears when demo is active, progress updates on step

**Primitives to extract**: `ProgressBar`

---

### Phase 6D: Guided Tours (Chunk 6.5)

**Goal**: Step-through onboarding tours with spotlight.

**Steps**:
1. Create `TourSystem.ts` (pure logic + AsyncStorage persistence)
2. Create `TourTargetRegistry.tsx` (ref-based measurement context)
3. Create `TourOverlay.tsx` (Modal-based spotlight + tooltip)
4. Create tour definitions (Capture Basics, AI Features, Task Workflow)
5. Extract `StepIndicator` primitive

**Verification**:
- [ ] Unit test: TourSystem tracks state, completion, prerequisites
- [ ] Unit test: Completed tours persist to/from AsyncStorage
- [ ] Storybook: TourOverlay renders tooltip at each position
- [ ] Integration: Starting a tour shows modal, Next advances, Finish completes
- [ ] Prerequisite tours gate correctly (AI Features requires Capture Basics)

**Primitives to extract**: `StepIndicator`, `SpotlightOverlay` (if feasible)

**Prerequisite**: Components need `testID` props for target registration.

---

### Phase 6E: Performance Utilities (Chunk 6.6)

**Goal**: Memoization, virtualization, lazy loading, debounce utilities.

**Steps**:
1. Create `memoization.ts` (selector memoization, equality helpers)
2. Create `virtualization.tsx` (FlatList wrapper + optimization hook)
3. Create `lazy-loading.ts` (lazy screens + preload utility)
4. Create `debounce.ts` (debounce, throttle, hooks, rafThrottle)

**Verification**:
- [ ] Unit test: createMemoizedSelector returns cached result for same state
- [ ] Unit test: shallowArrayEqual, shallowObjectEqual correctness
- [ ] Unit test: debounce delays calls, throttle limits frequency
- [ ] Unit test: useDebouncedValue updates after delay
- [ ] Integration: VirtualizedItemList renders only visible items

**No prerequisites** — these are standalone utilities.

---

### Phase 6F: Error Recovery & Network (Chunk 6.7)

**Goal**: State snapshots, auto-recovery, network status.

**Steps**:
1. Install `@react-native-async-storage/async-storage` and `@react-native-community/netinfo`
2. Create `RecoveryManager.ts` (snapshot save/restore with AsyncStorage)
3. Create `NetworkStatusBanner.tsx` (NetInfo-based status)
4. Create `useRecovery` hook
5. Extract `BannerNotification` primitive

**Verification**:
- [ ] Unit test: RecoveryManager saves snapshots, limits to maxSnapshots
- [ ] Unit test: restoreLatest dispatches STATE_RESTORED action
- [ ] Unit test: Auto-save fires on interval
- [ ] Storybook: NetworkStatusBanner shows offline/online states
- [ ] Integration: Toggling airplane mode shows/hides banner (manual test)

**Primitives to extract**: `BannerNotification`

---

### Phase 6G: Keyboard Shortcuts (Chunk 6.8)

**Goal**: Web-only keyboard shortcuts with help modal.

**Steps**:
1. Create `ShortcutManager.ts` (platform-guarded event listener)
2. Create `defaultShortcuts.ts` (register standard shortcuts)
3. Create `ShortcutHelpModal.tsx` (categorized shortcut display)
4. Extract `KeyboardKey` primitive

**Verification**:
- [ ] Unit test: ShortcutManager registers/unregisters, normalizes keys
- [ ] Unit test: Input focus disables non-global shortcuts
- [ ] E2E test: Pressing "a" opens OmniAdd, "t" toggles transcription, "?" opens help
- [ ] Storybook: ShortcutHelpModal renders all categories

**Primitives to extract**: `KeyboardKey`

**Note**: Only runs on `Platform.OS === 'web'`. Skip on native.

---

### Phase 6H: Demo Presets & Context (Chunk 6.9)

**Goal**: Feature-toggled demo presets with context propagation.

**Steps**:
1. Create `presets.ts` (preset definitions with feature flags)
2. Create `DemoContext.tsx` (DemoProvider + useDemoMode hook)
3. Create `DemoModeBanner.tsx` (active preset indicator)
4. Enhance existing `DemoLauncher.tsx` with preset section
5. Wire feature flags into AIServicesContext and TranscriptionContext

**Verification**:
- [ ] Unit test: getPresetById, getPresetsByCategory work correctly
- [ ] Storybook: DemoModeBanner renders with preset info
- [ ] Integration: Selecting "Basic Charting" preset disables AI suggestions
- [ ] Integration: Selecting "PC with Care Gaps" preset enables careGaps
- [ ] Integration: Exit demo returns to DemoLauncher

**Prerequisite**: Phase 6C (DemoController) for playback integration.

---

### Phase 6I: Final Integration (Chunk 6.10)

**Goal**: Wire all systems into App.tsx and AppProviders.

**Steps**:
1. Update `AppProviders.tsx` with DemoProvider, TourTargetProvider, NetworkStatusBanner
2. Rewrite `App.tsx` to include all overlays and shortcuts
3. Ensure provider ordering is correct
4. Add conditional rendering based on platform and demo state
5. Verify no provider conflicts

**Verification**:
- [ ] App boots without errors (both web and native)
- [ ] DemoModeBanner appears when preset is active
- [ ] TourOverlay renders when tour is started
- [ ] ShortcutHelpModal opens on "?" (web only)
- [ ] NetworkStatusBanner shows on disconnect
- [ ] Full E2E suite passes: `npm run test:e2e`

**Prerequisites**: All previous phases (6A–6H) complete.

---

### Recommended Execution Order (Parallelizable)

```
Phase 6A (E2E infra) ─────────────────────┐
                                           ├── Phase 6B (E2E tests)
Phase 6E (Performance) ── standalone       │
                                           │
Phase 6C (Demo Controller) ────────────────┼── Phase 6H (Presets)
                                           │
Phase 6D (Tours) ──────────────────────────┤
                                           │
Phase 6F (Error Recovery) ─────────────────┤
                                           │
Phase 6G (Shortcuts) ──────────────────────┤
                                           │
                                           └── Phase 6I (Integration)
```

**Can run in parallel**:
- 6A + 6C + 6D + 6E + 6F + 6G (all independent)

**Sequential dependencies**:
- 6B requires 6A
- 6H requires 6C
- 6I requires all others
