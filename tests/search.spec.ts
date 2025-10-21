// spec: REAL_ESTATE_TEST_PLAN.md

import { test, expect } from '@playwright/test';

// 2. Property search happy path
// 1. From homepage, select "For Sale" (or "For Rent") tab.
// 2. Choose a Location (e.g., "Miami") from the Location combobox.
// 3. Choose Bedrooms = "2" and Max Price = a value that should match existing listings (e.g., "$150,000" or "Any").
// 4. Click the "Search" button.
// 5. Wait for results to load and verify at least one result appears.
// 6. Click the first result's title to open property detail page.


test.describe('Property search', () => {
  test('search filters and opens first result', async ({ page, baseURL }) => {
    await page.goto(baseURL || process.env.BASE_URL || 'https://realestate.changewebsite.com/');

    // Select For Sale tab if present
    const forSale = page.getByRole('tab', { name: /For Sale/i });
    if (await forSale.count() > 0) await forSale.click();

    // Select Location combobox and choose Miami if present
    const location = page.getByRole('combobox', { name: /Location|All Citites/i });
    if (await location.count() > 0) {
      await location.selectOption({ label: 'Miami' }).catch(() => {});
    }

    // Select Bedrooms combobox
    const bedrooms = page.getByRole('combobox', { name: /Bedrooms|Property Size/i });
    if (await bedrooms.count() > 0) {
      await bedrooms.selectOption({ label: '2' }).catch(() => {});
    }

    // Click Search
    const searchBtn = page.getByRole('button', { name: /Search/i });
    await searchBtn.click();

    // Wait for results
    const firstResult = page.locator('a:has-text("Light and modern apartment")').first();
    await expect(firstResult).toBeVisible({ timeout: 10000 });

    // Open detail
    await firstResult.click();
    await page.waitForLoadState('networkidle');

    // Verify detail page contains title and price
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(page.locator('text=$')).toBeVisible();
  });
});
