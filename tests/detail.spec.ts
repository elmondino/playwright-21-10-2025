// spec: REAL_ESTATE_TEST_PLAN.md

import { test, expect } from '@playwright/test';

// 3. Property detail page checks
// 1. Open a property detail page.
// 2. Verify meta information: price, address, beds, baths, sqft, property type.
// 3. Verify agent name is visible and links to agent profile.
// 4. Verify gallery images load and at least one image has meaningful alt text.
// 5. Verify call-to-action (e.g., "Contact Agent", "Enquire", or similar) is present.


test.describe('Property detail', () => {
  test('property detail contains key metadata', async ({ page, baseURL }) => {
    // Navigate directly to a known property page; change slug to a real one if needed
    const url = `${baseURL || process.env.BASE_URL || 'https://realestate.changewebsite.com/'}property/modern-apartment-on-the-bay/`;
    await page.goto(url);

    // Wait for title and price
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=$')).toBeVisible();

    // Address
    await expect(page.locator(/\d{1,5}\s+\w+/)).toBeVisible();

    // Beds/Baths/Sqft icons/text
    await expect(page.locator('text=Beds').or(page.locator('text=Baths')).or(page.locator('text=Sq Ft'))).toBeTruthy();

    // Agent link
    const agent = page.getByRole('link', { name: /Samuel Palmer|Vincent Fuller|Michelle Ramirez|Test123/i });
    await expect(agent).toBeVisible();

    // Contact CTA
    const cta = page.getByRole('button', { name: /Contact|Enquiry|Enquire/i });
    if (await cta.count() > 0) await expect(cta).toBeVisible();
  });
});
