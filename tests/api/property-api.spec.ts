import { test, expect } from '@playwright/test';

// API tests use BASE_URL from environment. Set BASE_URL in .env or CI.
const BASE = process.env.BASE_URL ?? 'https://realestate.changewebsite.com';

test.describe('API — Properties & Inquiry', () => {
  test('GET: search properties returns array with expected fields', async ({ request }) => {
    // NOTE: replace the path below with the real API path discovered via network inspector.
    const res = await request.get(`${BASE}/wp-json/realestate/v1/properties?status=for-sale&location=Miami`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);

    const item = body[0];
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('title');
    expect(item).toHaveProperty('price');
    expect(item).toHaveProperty('address');
    expect(item).toHaveProperty('beds');
    expect(item).toHaveProperty('baths');
  });

  test('GET: property detail returns expected attributes', async ({ request }) => {
    // Use a real slug/ID from your seeded data or change to a valid id.
    const slug = 'renovated-studio';
    const res = await request.get(`${BASE}/wp-json/realestate/v1/properties/${slug}`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('title');
    expect(body).toHaveProperty('price');
    expect(body).toHaveProperty('address');
  });

  test('POST: inquiry returns validation errors for bad payload', async ({ request }) => {
    // Replace path with the actual inquiry endpoint discovered in the app.
    const res = await request.post(`${BASE}/wp-json/realestate/v1/inquiry`, {
      data: { email: 'not-an-email', firstName: '', gdpr: false },
    });

    // Many APIs return 400 or 422 on validation errors — accept either.
    expect([400, 422].includes(res.status())).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('errors');
  });
});
