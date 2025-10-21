// spec: REAL_ESTATE_TEST_PLAN.md

import { test, expect } from '@playwright/test';

// 1. Homepage smoke — load and primary elements
// 1. Navigate to `/` (e.g., `BASE_URL`).
// 2. Wait for main content (heading "Welcome To CaratHomes" or logo) to be visible.
// 3. Verify header navigation items: Properties, Featured, Realtor, Contact are present.
// 4. Verify search controls exist: status tabs, location dropdown, bedrooms, price combobox, and Search button.
// 5. Verify at least one featured property card is visible.

test.describe('Homepage smoke', () => {
  test('load homepage and check primary elements', async ({ page, baseURL }) => {
    await page.goto(baseURL || process.env.BASE_URL || 'https://realestate.changewebsite.com/');

    // Wait for main heading or logo
    await expect(page.getByRole('heading', { name: /Welcome To/i })).toBeVisible({ timeout: 10000 }).catch(async () => {
      await expect(page.getByRole('link', { name: /logo/i })).toBeVisible({ timeout: 10000 });
    });

    // Header nav items
    await expect(page.getByRole('link', { name: /Properties/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Featured/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Realtor/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Contact/i })).toBeVisible();

    // Search controls
    await expect(page.getByRole('tab', { name: /For Sale|For Rent|All Status/ })).toBeVisible();
    await expect(page.getByRole('combobox', { name: /Location|All Citites/i })).toBeVisible();
    await expect(page.getByRole('combobox', { name: /Max. Price|Max Price/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Search/i })).toBeVisible();

    // At least one featured property card
    const cards = page.locator('a:has-text("Light and modern apartment")').first();
    await expect(cards).toBeVisible();
  });
});
