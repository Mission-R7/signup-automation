
# Signup Automation — Playwright and TypeScript

## Overview

This project automates the signup workflow for:

https://authorized-partner.vercel.app/

It uses Playwright with TypeScript and the Gmail API for automatic email OTP verification.

## Technologies

- Node.js
- TypeScript
- Playwright Test
- Chromium (tested)
- Gmail API
- Google OAuth 2.0
- dotenv

## Automated Workflow

1. Open the registration page
2. Accept Terms and Conditions
3. Fill Account Setup information
4. Request an email OTP
5. Retrieve the OTP automatically using Gmail API
6. Verify the OTP
7. Complete Agency Details
8. Select Region of Operation
9. Complete Professional Experience
10. Select Services Offered
11. Complete Verification and Preferences
12. Select Preferred Countries and Institution Types
13. Verify the final Submit button is available

**Scope:** Final submission and post-submission success
verification are not implemented in the current test.

## Project Structure

- `tests/signup-e2e.spec.ts` — primary signup automation
- `tests/resume-signup.spec.ts` — supplementary incomplete-signup test
- `pages/agencyDetails.ts` — Agency Details automation
- `pages/professionalExperience.ts` — Professional Experience automation
- `pages/verificationPreferences.ts` — Verification and Preferences automation
- `helpers/gmailOtp.mjs` — Gmail OTP retrieval
- `scripts/` — Gmail authorization and diagnostic scripts
- `test-data/signupData.ts` — synthetic test information
- `playwright.config.ts` — Playwright configuration
- `tsconfig.json` — TypeScript configuration

## Prerequisites

- Node.js and npm
- Playwright-supported browser
- Google Cloud project with Gmail API enabled
- Google OAuth desktop client credentials
- An authorized Gmail test mailbox
- Unused, permitted test registration details

## Installation

Clone the repository and install dependencies:

```bash
git clone YOUR_REPOSITORY_URL
cd signup-automation
npm ci
npx playwright install chromium
```

## Environment Setup

Create a `.env` file in the project root.

```dotenv
BASE_URL=https://authorized-partner.vercel.app

RUN_LIVE_SIGNUP=false
RUN_RESUME_SIGNUP=false

TEST_EMAIL=
TEST_PHONE=
TEST_PASSWORD=

OTP_SENDER=no-reply@theauthorizedpartner.com
OTP_SUBJECT=Signup Confirm OTP
```

Enter your own authorized test credentials.

Do not commit `.env`, `token.json`, or
`credentials.json` to Git.

## Gmail API Configuration

1. Enable Gmail API in Google Cloud.
2. Configure an OAuth consent screen.
3. Add the test Gmail address to OAuth test users.
4. Download the OAuth desktop client configuration
   as `credentials.json` into the project root.
5. Run:

```bash
node scripts/gmail-connect.mjs
```

6. Verify the connection:

```bash
node scripts/debug-gmail.mjs
```

A local `token.json` is created after authorization.

## Running Tests

Check TypeScript:

```bash
npx tsc --noEmit
```

Run account validation tests in Chromium:

```bash
npx playwright test tests/signup-e2e.spec.ts --project=chromium
```

To run the live signup workflow, deliberately set:

```dotenv
RUN_LIVE_SIGNUP=true
```

Then run:

```bash
npx playwright test tests/signup-e2e.spec.ts --grep "Verify account using Gmail OTP automatically" --headed --project=chromium --workers=1 --retries=0 --trace on
```

The live test can reserve the email address after OTP
verification. Use an unused, authorized test account
and do not rerun automatically.

After execution, reset:

```dotenv
RUN_LIVE_SIGNUP=false
```

## Test Reports

View the Playwright HTML report:

```bash
npx playwright show-report
```

The project also supports screenshots, browser video,
and Playwright traces.

## Recorded Test Results

Account Setup validation:
- 6 passed, 1 skipped (Chromium run)

Resume incomplete registration:
- 1 passed, 0 failed
- Total execution time: 20.1 seconds

Signup workflow from the beginning:
- 1 passed, 0 failed
- Total execution time: 26.9 seconds
- Final Submit button reached, but not clicked

These are results from separate test executions.
They should not be interpreted as one combined run.

## Limitations

- Final registration submission is not tested.
- Final confirmation page is not verified.
- Gmail OAuth authorization requires local setup.
- Reusing a previously verified signup email may fail
  because the website retains incomplete accounts.
- The successful primary E2E run was in Chromium;
  equivalent Firefox and WebKit results are not claimed.

## Security

Credentials, OAuth tokens, test recordings, and private
account data are excluded from public source control.
Use dedicated test accounts and redact sensitive
information from demonstration recordings.
