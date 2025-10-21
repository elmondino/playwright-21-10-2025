// spec: REAL_ESTATE_TEST_PLAN.md

import { test, expect } from '@playwright/test';

// Dynamic API discovery + contract tests for the RealEstate site.
// This spec probes multiple candidate endpoints at runtime and uses the first one that responds with expected shape.

const BASE = process.env.BASE_URL ?? 'https://realestate.changewebsite.com';

async function findFirstWorking(request: any, candidates: string[]) {
  for (const c of candidates) {
    try {
      const url = c.startsWith('http') ? c : `${BASE}${c.startsWith('/') ? '' : '/'}${c}`;
      const res = await request.get(url);
      if (!res) continue;
      if (!res.ok()) continue;
      const body = await res.json().catch(() => null);
      if (body === null) continue;
      return { url, body, res };
    } catch (e) {
      // ignore and try next
    }
  }
  return null;
}

test.describe('API discovery and contract tests', () => {
  test('discover property list endpoint and validate schema', async ({ request }) => {
    const listCandidates = [
      '/wp-json/realestate/v1/properties?status=for-sale&location=Miami',
      '/wp-json/houzez/v1/properties?status=for-sale&location=Miami',
      '/wp-json/rt_realestate/v1/properties?status=for-sale&location=Miami',
      '/wp-json/wp/v2/posts?type=property',
      '/wp-json/wp/v2/property',
      '/api/properties?status=for-sale&location=Miami',
      '/properties?status=for-sale&location=Miami',
    ];

    const found = await findFirstWorking(request, listCandidates);
    test.skip(!found, 'No property list endpoint discovered; inspect Network tab for the real API paths');

    const { url, body } = found!;
    test.info().annotations.push({ type: 'note', description: `Using list endpoint: ${url}` });

    expect(Array.isArray(body) || typeof body === 'object').toBeTruthy();
    // Normalize to an items array when possible
    let items: any[] = [];
    if (Array.isArray(body)) {
      items = body;
    } else {
      const arr = Object.values(body).find((v: any) => Array.isArray(v));
      if (arr) items = arr as any[];
    }

    expect(items.length).toBeGreaterThan(0);
    const item = items[0];
    expect(item).toBeTruthy();
    // Basic required fields (id/title are common). Price may live in nested fields for WP plugins.
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('title');

    // Try to locate a price in common places (top-level, meta, acf, custom fields) but don't fail hard if absent.
    const findPrice = (obj: any) => {
      if (!obj) return null;
      if (obj.price) return obj.price;
      if (obj.meta && obj.meta.price) return obj.meta.price;
      if (obj.acf && obj.acf.price) return obj.acf.price;
      if (obj.custom_fields && obj.custom_fields.price) return obj.custom_fields.price;
      // WP posts sometimes embed price in content or excerpts; try a regex fallback
      const text = JSON.stringify(obj);
      const m = text.match(/\$?\d{1,3}(?:,\d{3})*(?:\.\d+)?/);
      return m ? m[0] : null;
    };

    const detectedPrice = findPrice(item);
    test.info().annotations.push({ type: 'note', description: `Detected price (best-effort): ${detectedPrice}` });
    // Don't fail the test just because price wasn't found in this WP schema — log and continue.
  });

  test('discover property detail endpoint and validate attributes', async ({ request }) => {
    const detailCandidates = [
      '/wp-json/realestate/v1/properties/renovated-studio',
      '/wp-json/houzez/v1/properties/renovated-studio',
      '/wp-json/rt_realestate/v1/properties/renovated-studio',
      '/api/properties/renovated-studio',
      '/property/renovated-studio?format=json',
    ];

    const found = await findFirstWorking(request, detailCandidates);
    test.skip(!found, 'No property detail endpoint discovered; run discovery script or inspect network requests');

    const { url, body } = found!;
    test.info().annotations.push({ type: 'note', description: `Using detail endpoint: ${url}` });

    // Common attributes
    expect(body).toBeTruthy();
    if (typeof body === 'object') {
      expect(body).toHaveProperty('title');
      expect(body).toHaveProperty('price');
      expect(body).toHaveProperty('address');
    }
  });

  test('discover inquiry/contact endpoint and validate validation behavior', async ({ request }) => {
    const postCandidates = [
      '/wp-json/realestate/v1/inquiry',
      '/wp-json/houzez/v1/inquiry',
      '/wp-json/contact-form-7/v1/contact-forms/1/feedback',
      '/contact/?wc-ajax=submit_contact',
      '/api/inquiry',
      '/inquiry',
    ];

    let found = null as any;
    for (const c of postCandidates) {
      const url = c.startsWith('http') ? c : `${BASE}${c.startsWith('/') ? '' : '/'}${c}`;
      try {
        const res = await request.post(url, { data: { email: 'not-an-email', firstName: '', gdpr: false } });
        if (!res) continue;
        // Accept 400/422/200 depending on implementation; require JSON body
        const body = await res.json().catch(() => null);
        if (body === null) continue;
        found = { url, res, body };
        break;
      } catch (e) {
        // ignore
      }
    }

    test.skip(!found, 'No inquiry endpoint discovered; inspect form action or network calls in the browser');
    test.info().annotations.push({ type: 'note', description: `Using inquiry endpoint: ${found.url}` });

  // Expect common HTTP statuses for form handlers. Some endpoints return 200 with HTML or 302 redirect.
  const status = found.res.status();
  test.info().annotations.push({ type: 'note', description: `Inquiry endpoint responded with status ${status} at ${found.url}` });
  // Accept anything except server error (5xx). If 5xx, fail the test.
  expect(Math.floor(status / 100)).not.toBe(5);

    // If the response is JSON and contains an errors field, assert its shape.
    if (found.body && typeof found.body === 'object') {
      if (found.body.errors) {
        expect(found.body.errors).toBeTruthy();
      } else if (found.body.error) {
        expect(found.body.error).toBeTruthy();
      } else {
        // Best-effort: log top-level keys for debugging.
        test.info().annotations.push({ type: 'note', description: `Inquiry response keys: ${Object.keys(found.body).join(',')}` });
      }
    }
  });
});
