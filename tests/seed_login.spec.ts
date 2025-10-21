import { test, expect } from '@playwright/test';

// Seed login test for https://realestate.changewebsite.com/
// Reads credentials from environment variables: TEST_USERNAME and TEST_PASSWORD

const BASE_URL = process.env.BASE_URL || 'https://realestate.changewebsite.com/';
const USERNAME = process.env.TEST_USERNAME || '';
const PASSWORD = process.env.TEST_PASSWORD || '';

test.describe('Seed: realestate login', () => {
  test('visit homepage and log in', async ({ page }) => {
    test.skip(!USERNAME || !PASSWORD, 'Missing TEST_USERNAME/TEST_PASSWORD environment variables');

    await page.goto(BASE_URL);

    // First check if we're already logged in, if so log out
    const logoutLinks = [
      'text=Logout',
      'text=Log out',
      'a:has-text("Logout")',
      'a:has-text("Log out")'
    ];
    
    for (const logoutSelector of logoutLinks) {
      const logoutLink = page.locator(logoutSelector);
      if (await logoutLink.isVisible()) {
        await logoutLink.click();
        // Wait for logout to complete and page to reload
        await page.waitForLoadState('load');
        break;
      }
    }

    // Look for various combinations of login/sign in links or buttons
    const loginTriggers = [
      'a[href*="login"]',
      'a.btn-auth',
      '.user-menu a',
      'button[type="button"]:has-text("Login")',
      'button[type="button"]:has-text("Sign in")',
      '.nav-item >> text=Login',
      '.nav-item >> text=Sign in'
    ];

    // Try each potential login trigger
    let loginClicked = false;
    for (const trigger of loginTriggers) {
      const loginButton = page.locator(trigger);
      if (await loginButton.count() > 0 && await loginButton.isVisible()) {
        await loginButton.click();
        loginClicked = true;
        break;
      }
    }

    if (!loginClicked) {
      // If we couldn't find a login button, the test needs fixing
      test.fail(true, 'Could not find login button/link on the page');
    }

    // Wait for the login form modal/element to appear
    const loginForm = page.locator('form[id*="login"], .login-form, form.login-form-wrap').first();
    await loginForm.waitFor({ state: 'visible', timeout: 10000 });

    // Get the input fields within the form
    const usernameLocator = loginForm.locator('input[name="username"]');
    const passwordLocator = loginForm.locator('input[name="password"]');
    await usernameLocator.waitFor({ state: 'visible', timeout: 10000 });
    await passwordLocator.waitFor({ state: 'visible', timeout: 10000 });

    await usernameLocator.fill(USERNAME);
    await passwordLocator.fill(PASSWORD);

    // If there's a "remember" checkbox, check it (if present)
    const remember = page.locator('input[name="remember"]');
    if (await remember.count() > 0) {
      try {
        await remember.check();
      } catch (e) {
        // ignore if not interactable
      }
    }

    // Click the login button (uses the button id we discovered: houzez-login-btn)
    const loginBtn = page.locator('#houzez-login-btn');
    await loginBtn.click();

    // Wait for navigation/network to settle
    await page.waitForLoadState('networkidle');

    // Heuristics to detect successful login: look for common account/logout links
    const loggedInSelectors = [
      'text=Logout',
      'text=Log out',
      'text=My Account',
      'text=Dashboard',
      'a:has-text("Dashboard")'
    ];

    let success = false;
    for (const sel of loggedInSelectors) {
      try {
        await page.waitForSelector(sel, { timeout: 5000 });
        success = true;
        break;
      } catch (e) {
        // continue checking other selectors
      }
    }

    expect(success).toBeTruthy();
  });
});
