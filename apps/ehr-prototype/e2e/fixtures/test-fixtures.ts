import { test as base, type Page, type Locator } from '@playwright/test';

// ============================================================================
// Page Object Models
// ============================================================================

export class CaptureViewPage {
  readonly container: Locator;

  constructor(readonly page: Page) {
    this.container = page.locator('[data-testid="capture-view"]');
  }

  async isVisible() {
    return this.container.isVisible();
  }

  async waitForVisible() {
    await this.container.waitFor({ state: 'visible' });
  }
}

export class ProcessViewPage {
  readonly container: Locator;

  constructor(readonly page: Page) {
    this.container = page.locator('[data-testid="process-view"]');
  }

  async isVisible() {
    return this.container.isVisible();
  }

  async waitForVisible() {
    await this.container.waitFor({ state: 'visible' });
  }
}

export class ReviewViewPage {
  readonly container: Locator;

  constructor(readonly page: Page) {
    this.container = page.locator('[data-testid="review-view"]');
  }

  async isVisible() {
    return this.container.isVisible();
  }

  async waitForVisible() {
    await this.container.waitFor({ state: 'visible' });
  }
}

// ============================================================================
// Extended Test Fixture
// ============================================================================

interface EhrFixtures {
  captureView: CaptureViewPage;
  processView: ProcessViewPage;
  reviewView: ReviewViewPage;
}

export const test = base.extend<EhrFixtures>({
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

export { expect } from '@playwright/test';
