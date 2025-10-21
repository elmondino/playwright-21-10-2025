import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'https://realestate.changewebsite.com';

test.describe('Contact page & form', () => {
  test('Contact page loads and form action is reachable', async ({ request }) => {
    // Load contact page HTML
    const res = await request.get(`${BASE}/contact/`);
    expect(res.ok()).toBeTruthy();
    const html = await res.text();

    // Try to extract a form action or wc-ajax endpoint
    const formActionMatch = html.match(/<form[^>]*action="([^"]+)"/i);
    const ajaxMatch = html.match(/wc-ajax=([a-zA-Z0-9_\-]+)/i);

    test.info().annotations.push({ type: 'note', description: `Form action: ${formActionMatch ? formActionMatch[1] : 'none'}, ajax: ${ajaxMatch ? ajaxMatch[0] : 'none'}` });

    // If there's a form action, try a GET to the action URL (some are relative)
    if (formActionMatch) {
      let action = formActionMatch[1];
      if (!action.startsWith('http')) action = `${BASE}${action.startsWith('/') ? '' : '/'}${action}`;
      const aRes = await request.get(action);
      // Accept 200/404/405 depending on server; just ensure no 5xx
      expect(Math.floor(aRes.status() / 100)).not.toBe(5);
    }

    // If wc-ajax found, assert contact wc-ajax endpoint isn't 5xx
    if (ajaxMatch) {
      const a = `${BASE}/contact/?${ajaxMatch[0]}`;
      const aRes = await request.get(a);
      expect(Math.floor(aRes.status() / 100)).not.toBe(5);
    }
  });
});
