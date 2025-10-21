import { test } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'https://realestate.changewebsite.com';

async function probe(request: any, path: string) {
  const url = path.startsWith('http') ? path : `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  try {
    const res = await request.get(url);
    const status = res.status();
    let body: any = null;
    try {
      body = await res.json();
    } catch (e) {
      // non-json
      body = await res.text();
    }
    // Trim large bodies for logging
    const sample = typeof body === 'string' ? body.slice(0, 500) : JSON.stringify(body, null, 2).slice(0, 1000);
    console.log(`PROBE: ${url} -> ${status}`);
    console.log(sample);
    return { url, status, body };
  } catch (err) {
    console.log(`PROBE ERROR: ${url} -> ${String(err)}`);
    return null;
  }
}

test('discover API endpoints and log samples', async ({ request }) => {
  const listCandidates = [
    '/wp-json/realestate/v1/properties?status=for-sale&location=Miami',
    '/wp-json/houzez/v1/properties?status=for-sale&location=Miami',
    '/wp-json/rt_realestate/v1/properties?status=for-sale&location=Miami',
    '/wp-json/wp/v2/posts?type=property',
    '/wp-json/wp/v2/posts?per_page=10',
    '/wp-json/wp/v2/property',
    '/api/properties?status=for-sale&location=Miami',
    '/properties?status=for-sale&location=Miami',
    '/?rest_route=/wp/v2/posts&per_page=10',
  ];

  const detailCandidates = [
    '/wp-json/realestate/v1/properties/renovated-studio',
    '/wp-json/houzez/v1/properties/renovated-studio',
    '/wp-json/rt_realestate/v1/properties/renovated-studio',
    '/api/properties/renovated-studio',
    '/property/renovated-studio?format=json',
  ];

  const postCandidates = [
    '/wp-json/realestate/v1/inquiry',
    '/wp-json/houzez/v1/inquiry',
    '/wp-json/contact-form-7/v1/contact-forms/1/feedback',
    '/contact/?wc-ajax=submit_contact',
    '/api/inquiry',
    '/inquiry',
  ];

  console.log('--- PROBING LIST CANDIDATES ---');
  for (const p of listCandidates) await probe(request, p);

  console.log('--- PROBING DETAIL CANDIDATES ---');
  for (const p of detailCandidates) await probe(request, p);

  console.log('--- PROBING POST CANDIDATES ---');
  for (const p of postCandidates) {
    const url = p.startsWith('http') ? p : `${BASE}${p.startsWith('/') ? '' : '/'}${p}`;
    try {
      const res = await request.post(url, { data: { email: 'not-an-email', firstName: '', gdpr: false } });
      const status = res.status();
      let body: any = null;
      try { body = await res.json(); } catch (e) { body = await res.text(); }
      console.log(`PROBE POST: ${url} -> ${status}`);
      const sample = typeof body === 'string' ? body.slice(0, 500) : JSON.stringify(body, null, 2).slice(0, 1000);
      console.log(sample);
    } catch (err) {
      console.log(`PROBE POST ERROR: ${url} -> ${String(err)}`);
    }
  }
});
