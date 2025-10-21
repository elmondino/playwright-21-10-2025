# RealEstate.changewebsite.com — Test Plan

## Executive summary
This document provides a structured test plan for https://realestate.changewebsite.com/ (CaratHomes theme). It was created from an automated inspection of the live homepage and covers primary user journeys, happy-path scenarios, edge cases, validation/error handling and accessibility/responsiveness checks. Tests are written so they can be automated with Playwright (the repository already contains Playwright tests).

Assumptions
- Tests will run against a test/staging environment URL (set `BASE_URL` in `.env` or CI). Do not run state-changing tests against production without approval.
- Each scenario assumes a fresh browser context (no cached session) unless noted otherwise.
- Valid test accounts / credentials (if login is required) are available via environment variables: `TEST_USERNAME`, `TEST_PASSWORD`.
- Seed/fixture data may be required for some flows (the repo contains `tests/seed*.spec.ts`).

Scope
- Core site browsing: search, filtering, property listing detail pages, agent profiles.
- Inquiry & contact form flows (client-side validations and submission path).
- Listing compare and pagination/carousel controls.
- Navigation links, header/footer content, and discoverability.
- Accessibility and responsiveness (desktop + mobile viewport smoke checks).

Out of scope (for this plan)
- Deep backend API testing (unless required and test credentials/API tokens are provided).
- Load/performance testing beyond simple page load times.

---

## Test design notes
- Prefer semantic selectors (role, label text) when building Playwright tests: getByRole/getByLabel/getByPlaceholder.
- Keep tests independent and idempotent. If a test creates or alters data, clean up after or run within a dedicated test account/fixture.
- When verifying content from CMS, allow for non-deterministic text (use contains or regex) and focus on presence/format and key fields (title, price, address).

---

## Test scenarios
Each scenario below includes: title, starting assumptions, steps (numbered), expected outcome(s), success criteria, and failure conditions.

### 1. Homepage smoke — load and primary elements
Assumptions: clean context, `BASE_URL` points to the site.
Steps:
1. Navigate to `/` (e.g., `BASE_URL`).
2. Wait for main content (heading "Welcome To CaratHomes" or logo) to be visible.
3. Verify header navigation items: Properties, Featured, Realtor, Contact are present.
4. Verify search controls exist: status tabs, location dropdown, bedrooms, price combobox, and Search button.
5. Verify at least one featured property card is visible.

Expected:
- Page loads within 5s (tolerance configurable).
- Header and search controls are present and interactable.
- At least one property card shows title, price and at least one meta (beds/baths/sqft).

Success criteria: Conditions above satisfied. Failure: missing header items, controls not interactable, or no featured properties.

---

### 2. Property search happy path
Assumptions: seed data exists or the site has public listings.
Steps:
1. From homepage, select "For Sale" (or "For Rent") tab.
2. Choose a Location (e.g., "Miami") from the Location combobox.
3. Choose Bedrooms = "2" and Max Price = a value that should match existing listings (e.g., "$150,000" or "Any").
4. Click the "Search" button.
5. Wait for results to load and verify at least one result appears.
6. Click the first result's title to open property detail page.

Expected:
- Results list filtered according to selected criteria.
- Property detail page shows title, price, address, beds, baths, square footage, and agent link.

Success criteria: Filter returns >0 results and detail page contains key fields. Failure: search returns zero results unexpectedly or detail page missing main attributes.

---

### 3. Property detail page checks
Assumptions: property detail page reachable from search or direct link.
Steps:
1. Open a property detail page.
2. Verify meta information: price, address, beds, baths, sqft, property type.
3. Verify agent name is visible and links to agent profile.
4. Verify gallery images load and at least one image has meaningful alt text.
5. Verify call-to-action (e.g., "Contact Agent", "Enquire", or similar) is present.

Expected: all details present; images load; agent link navigates to agent profile.

Success criteria: Key fields present and agent link works. Failure: missing price/address, broken images, or agent link 404.

---

### 4. Contact / Inquiry form — happy path
Assumptions: Contact/inquiry form is available on homepage or property pages.
Steps:
1. Locate the inquiry/contact form on homepage (fields visible during page snapshot: Inquiry Type, Information, First Name, Last Name, Email Address, Location, Zip Code, Property type, Max price, Min size, beds, baths, GDPR checkbox).
2. Fill in required fields with valid test data.
3. Check GDPR consent checkbox.
4. Click Submit.
5. Observe confirmation UI (success message, redirect, or thank-you modal/email trigger indication).

Expected:
- Form validates inputs and accepts valid submission.
- Confirmation message shown (e.g., "Thank you" or redirect to a confirmation page).

Success criteria: Submission accepted and confirmation displayed. Failure: validation error preventing submission despite valid data, or server error (500).

Notes: Do not spam production contact addresses. Use test email address or a staging endpoint.

---

### 5. Contact / Inquiry form — negative validation tests
Assumptions: same as scenario 4.
Test cases (each run independently):
1. Missing required fields (First Name) → expect inline validation and no submission.
2. Invalid email format ("not-an-email") → expect email validation error.
3. GDPR checkbox unchecked → expect submission blocked with clear message.
4. Extremely long values in text fields (e.g., 5k chars) → expect either trimmed input or server/client validation error (test for graceful handling).

Expected: validation messages displayed and no submission occurs when inputs invalid.

Success criteria: Clear validation messages and server returns no side effects for invalid submissions.

---

### 6. Agent profile navigation
Assumptions: Agent links visible on detail cards and profile pages exist.
Steps:
1. From a property card or listing, click the agent name.
2. Wait for agent profile page to load.
3. Verify agent name, description, contact link/email, and list of properties by that agent appear.

Expected: profile loads and agent properties are listed.

Success criteria: Agent page accessible and contains expected elements. Failure: 404 or missing contact information.

---

### 7. Compare properties workflow
Assumptions: property cards have a way to add to compare and a compare page exists.
Steps:
1. On listings/carousel, add two properties to compare (use the UI controls on cards).
2. Click the Compare link/button.
3. Verify the compare page shows the selected properties and key attributes side-by-side (price, beds, baths, sqft, property type).
4. Remove a property from compare and verify UI updates.

Expected: compare page lists the selected properties and compare controls work.

Success criteria: selected properties appear; removal updates the list. Failure: compare page empty or wrong items shown.

---

### 8. Carousel / pagination controls
Assumptions: homepage feature carousel or paginated results.
Steps:
1. Identify Prev and Next carousel buttons on homepage.
2. Click Next and verify featured items change (title/image change).
3. Click Prev and verify items revert.
4. For paginated results, navigate to page 2 and back and verify results change accordingly.

Expected: carousel and pagination are responsive and update content.

Success criteria: controls update content without JS errors.

---

### 9. Navigation link regression
Assumptions: header/footer links should navigate without error.
Steps:
1. Click main nav links: Properties, Featured, Realtor, Contact.
2. Click footer city links (Miami, Los Angeles, Chicago, New York).
3. Verify each link loads a page with expected heading/title.

Expected: links are not broken (no 404) and landing pages contain relevant headings.

Success criteria: links navigate and content present. Failure: 404 or redirect loops.

---

### 10. Accessibility checks (basic)
Assumptions: baseline a11y checks via Playwright + axe or manual checks.
Steps:
1. Run accessibility snapshot on homepage and property pages.
2. Verify: images have alt text, form fields have labels/placeholders and associated aria attributes, tab order is logical, landmark elements (main, nav) present.
3. Check contrast ratios for key CTAs (manual or automated via axe).

Expected: no high/severe accessibility violations; critical elements labelled.

Success criteria: zero critical a11y violations. Failure: missing labels, unlabeled form controls, or severe contrast issues.

---

### 11. Responsiveness (mobile viewport)
Assumptions: layout responds to smaller viewports.
Steps:
1. Set viewport to a typical mobile size (375x812).
2. Open homepage and verify: header collapses to mobile menu, search controls adapt (are usable), property cards stack vertically and CTAs visible.
3. Run a happy-path search and open a property detail page to confirm mobile layout.

Expected: site usable and navigable on the mobile viewport.

Success criteria: core flows work without visual breakage.

---

### 12. Security & input handling sanity checks
Assumptions: only non-malicious tests run.
Steps:
1. Submit form fields with special characters and scripts encoded (e.g., `<script>` as text) to confirm server sanitizes or responds safely.
2. Verify server returns non-sensitive data (no secrets) in responses or error messages.

Expected: server handles special characters without executing scripts or leaking secrets.

Success criteria: no reflected XSS, no leaked credentials. Failure: script execution or sensitive data in responses.

---

## Test data and accounts
- Use a dedicated test email for contact/inquiry forms: e.g., `qa+realestate@example.com`.
- If login tests are required, use `TEST_USERNAME` and `TEST_PASSWORD` environment variables configured in CI and locally in `.env` (never commit real credentials).
- For search filters, document which price/bedroom values should match seeded test listings.

## Test execution notes (Playwright)
- Use role-based selectors where possible, e.g., page.getByRole('link', { name: /Contact/ }) or page.getByPlaceholder('Email Address').
- Use `test.step()` to group high-level actions and `test.info().attachments` for screenshots on failures.
- For flaky UI (carousel), add deterministic waits relying on DOM changes rather than fixed sleep.
- When tests depend on seeded state, run `tests/seed*.spec.ts` first.

## Prioritized test list (minimal to full)
1. Homepage smoke
2. Property search -> detail
3. Contact form happy path
4. Contact form negative validations
5. Agent profile and navigation
6. Compare properties + pagination
7. Accessibility and mobile responsiveness
8. Security input handling

## Success criteria for overall test suite
- All critical/happy-path tests pass.
- No critical accessibility violations.
- No broken navigation links (404s) on primary nav and footer.

## Reporting and artifacts
- Capture screenshots on test failures and attach to the test run artifacts (Playwright's `test-results/` is already present).
- Save HTML snapshots or traces for intermittent failures.

## Next steps / recommended additions
- Implement automated Playwright tests for each scenario above as individual spec files.
- Add CI pipeline that runs the minimal suite on PRs and the full suite nightly; configure secrets for `TEST_USERNAME`, `TEST_PASSWORD`, `BASE_URL`.
- Add Playwright's accessibility plugin (axe) to fail builds on critical violations.
- Add data seeding endpoints or APIs so tests can reliably create and tear down test data.

---

End of plan.
