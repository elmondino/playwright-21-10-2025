Seed login test for realestate.changewebsite.com

Instructions

1) Install dependencies (if not already):

powershell

    npm install

2) Provide credentials via environment variables. You can either copy `.env.example` to `.env` (if using dotenv) or set env vars inline.

PowerShell example (temporary for this shell session):

powershell

    $env:TEST_USERNAME = "your@example.com"
    $env:TEST_PASSWORD = "yourpassword"
    $env:BASE_URL = "https://realestate.changewebsite.com/"
    npx playwright test tests/seed_login.spec.ts

Or run with single-line env (PowerShell) without persisting vars:

powershell

    $env:TEST_USERNAME = "your@example.com"; $env:TEST_PASSWORD = "yourpassword"; npx playwright test tests/seed_login.spec.ts

Notes
- The test looks for inputs named `username` and `password` and clicks `#houzez-login-btn` as the login trigger.
- If the site shows different selectors in the future, update `tests/seed_login.spec.ts` accordingly.
