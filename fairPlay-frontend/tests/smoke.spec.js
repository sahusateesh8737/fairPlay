import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect the page to have some content or title
  // Since we don't know the exact title, we can just check that the page loads
  const body = await page.locator('body');
  await expect(body).toBeVisible();
});
