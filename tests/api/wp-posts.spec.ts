import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'https://realestate.changewebsite.com';

test.describe('WP REST API — posts (used for listings)', () => {
  test('GET: posts list returns items with expected fields', async ({ request }) => {
    const res = await request.get(`${BASE}/wp-json/wp/v2/posts?per_page=10`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);

    const item = body[0];
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('slug');
    expect(item).toHaveProperty('link');
    expect(item).toHaveProperty('title');
    expect(item.title).toHaveProperty('rendered');
  });

  test('GET: post detail returns content and matches id', async ({ request }) => {
    const listRes = await request.get(`${BASE}/wp-json/wp/v2/posts?per_page=1`);
    expect(listRes.ok()).toBeTruthy();
    const list = await listRes.json();
    expect(Array.isArray(list) && list.length > 0).toBeTruthy();

    const id = list[0].id;
    const res = await request.get(`${BASE}/wp-json/wp/v2/posts/${id}`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('id', id);
    expect(body).toHaveProperty('content');
    expect(body.content).toHaveProperty('rendered');
  });
});
