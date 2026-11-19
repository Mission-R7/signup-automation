import { fillVerificationPreferences } from '../pages/verificationPreferences';
import { test, expect } from '@playwright/test';
import 'dotenv/config';

import { getVerificationCode } from '../helpers/gmailOtp.mjs';
import { fillAgencyDetails } from '../pages/agencyDetails';
import { fillProfessionalExperience } from '../pages/professionalExperience';

test.describe('Signup End-to-End Workflow', () => {
  const baseURL = process.env.BASE_URL;

  test.beforeEach(() => {
    if (!baseURL) {
      throw new Error('BASE_URL is missing from .env');
    }
  });

  
  // TEST 1: REGISTRATION ENTRY PAGE
  
  test('Registration entry page is available', async ({ page }) => {
    await page.goto(`${baseURL}/register`);

    const termsCheckbox = page.getByRole('checkbox', {
      name: 'I agree to the Terms of',
    });

    await expect(termsCheckbox).toBeVisible();

    await page.screenshot({
      path: test.info().outputPath('registration-entry.png'),
      fullPage: true,
    });
  });

  
  // TEST 2: ACCOUNT SETUP FIELDS
  
  test('Account setup fields accept test data', async ({ page }) => {
    await page.goto(`${baseURL}/register`);

    await page.getByRole('checkbox', {
      name: 'I agree to the Terms of',
    }).check();

    await page.getByRole('button', {
      name: 'Continue',
    }).click();

    const firstName = page.getByRole('textbox', {
      name: 'First Name',
    });

    const lastName = page.getByRole('textbox', {
      name: 'Last Name',
    });

    await expect(firstName).toBeVisible();
    await expect(lastName).toBeVisible();

    await firstName.fill('QA');
    await lastName.fill('Tester');

    await expect(firstName).toHaveValue('QA');
    await expect(lastName).toHaveValue('Tester');
  });

  
  // TEST 3: VERIFY ALL SIX FIELDS
  
  test('Account setup validates all required fields', async ({ page }) => {
    await page.goto(`${baseURL}/register`);

    await page.getByRole('checkbox', {
      name: 'I agree to the Terms of',
    }).check();

    await page.getByRole('button', {
      name: 'Continue',
    }).click();

    const firstName = page.getByRole('textbox', {
      name: 'First Name',
    });

    const lastName = page.getByRole('textbox', {
      name: 'Last Name',
    });

    const email = page.getByRole('textbox', {
      name: 'Email Address',
    });

    const phone = page.getByRole('textbox', {
      name: 'Phone Number',
    });

    const password = page.locator('input[name="password"]');
    const confirmPassword = page.locator('input[name="confirmPassword"]');

    for (const field of [
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
    ]) {
      await expect(field).toBeVisible();
      await expect(field).toBeEditable();
    }

    await firstName.fill('QA');
    await lastName.fill('Tester');
    await email.fill('qa.validation@example.com');
    await phone.fill('9800000000');

    const testPassword = 'ExampleOnly#A123';

    await password.fill(testPassword);
    await confirmPassword.fill(testPassword);

    await expect(firstName).toHaveValue('QA');
    await expect(lastName).toHaveValue('Tester');
    await expect(email).toHaveValue('qa.validation@example.com');
    await expect(phone).toHaveValue('9800000000');
    await expect(password).toHaveValue(testPassword);
    await expect(confirmPassword).toHaveValue(testPassword);

    await expect(password).toHaveAttribute('type', 'password');
    await expect(confirmPassword).toHaveAttribute(
      'type',
      'password'
    );
  });

  
  // TEST 4: PASSWORD MISMATCH VALIDATION
  
  test('Account setup rejects mismatched passwords', async ({ page }) => {
    await page.goto(`${baseURL}/register`);

    await page.getByRole('checkbox', {
      name: 'I agree to the Terms of',
    }).check();

    await page.getByRole('button', {
      name: 'Continue',
    }).click();

    const password = page.locator('input[name="password"]');

    const confirmPassword = page.locator(
      'input[name="confirmPassword"]'
    );

    await password.fill('ExamplePassword#123');
    await confirmPassword.fill('DifferentPassword#456');

    await confirmPassword.blur();

    await expect(password).toHaveValue('ExamplePassword#123');

    await expect(confirmPassword).toHaveValue(
      'DifferentPassword#456'
    );

    const passwordError = page.getByText(
      /passwords? (do not match|don't match)|password mismatch/i
    );

    await expect(passwordError.first()).toBeVisible();

    console.log('Password mismatch validation passed.');

    await page.screenshot({
      path: test.info().outputPath('password-mismatch.png'),
      fullPage: true,
    });
  });


  // TEST 5: INVALID EMAIL VALIDATION

  test('Account setup detects invalid email format', async ({ page }) => {
    await page.goto(`${baseURL}/register`);

    await page.getByRole('checkbox', {
      name: 'I agree to the Terms of',
    }).check();

    await page.getByRole('button', {
      name: 'Continue',
    }).click();

    const email = page.getByRole('textbox', {
      name: 'Email Address',
    });

    await expect(email).toBeVisible();

    await email.fill('invalid-email');
    await email.blur();

    const inputType = await email.getAttribute('type');

    console.log('Email input type:', inputType);

    const isInvalid = await email.evaluate(
      (element: HTMLInputElement) => !element.validity.valid
    );

    console.log('Invalid email detected:', isInvalid);

    expect(isInvalid).toBe(true);
  });

  
  // TEST 6: EMPTY REQUIRED FIELDS
  
  test('Account setup rejects empty required fields', async ({ page }) => {
    await page.goto(`${baseURL}/register`);

    await page.getByRole('checkbox', {
      name: 'I agree to the Terms of',
    }).check();

    await page.getByRole('button', {
      name: 'Continue',
    }).click();

    const nextButton = page.getByRole('button', {
      name: 'Next',
    });

    await nextButton.click();

    const firstName = page.getByRole('textbox', {
      name: 'First Name',
    });

    await expect(firstName).toBeVisible();
    await expect(firstName).toHaveValue('');

    await page.screenshot({
      path: test.info().outputPath('empty-required-fields.png'),
      fullPage: true,
    });
  });

  
  // TEST 7: OTP + AGENCY + EXPERIENCE
  
  test('Verify account using Gmail OTP automatically', async ({ page }) => {

    // Prevent accidental live signup attempts.
    test.skip(
      process.env.RUN_LIVE_SIGNUP !== 'true',
      'Live signup is disabled in .env'
    );

    const testEmail = process.env.TEST_EMAIL;
    const testPhone = process.env.TEST_PHONE;
    const testPassword = process.env.TEST_PASSWORD;

    if (!testEmail || !testPhone || !testPassword) {
      throw new Error(
        'TEST_EMAIL, TEST_PHONE and TEST_PASSWORD must be set in .env'
      );
    }

     // PHASE 1: ACCOUNT SETUP
    
    await page.goto(`${baseURL}/register`);

    await page.getByRole('checkbox', {
      name: 'I agree to the Terms of',
    }).check();

    await page.getByRole('button', {
      name: 'Continue',
    }).click();

    await page.getByRole('textbox', {
      name: 'First Name',
    }).fill('QA');

    await page.getByRole('textbox', {
      name: 'Last Name',
    }).fill('Tester');

    await page.getByRole('textbox', {
      name: 'Email Address',
    }).fill(testEmail);

    await page.getByRole('textbox', {
      name: 'Phone Number',
    }).fill(testPhone);

    await page.locator('input[name="password"]')
      .fill(testPassword);

    await page.locator('input[name="confirmPassword"]')
      .fill(testPassword);

    // Record when the OTP is requested.
    const otpRequestedAt = Date.now();

    await page.getByRole('button', {
      name: 'Next',
    }).click();

    
    // PHASE 1B: AUTOMATIC GMAIL OTP
    
    await expect(
      page.getByRole('button', {
        name: 'Verify Code',
      })
    ).toBeVisible();

    const otp = await getVerificationCode({
      receivedAfter: otpRequestedAt,
      timeoutMs: 90000,
    });

    const otpField = page.getByRole('textbox');

    await expect(otpField).toHaveCount(1);
    await expect(otpField).toBeVisible();

    await otpField.fill(otp);

    await page.getByRole('button', {
      name: 'Verify Code',
    }).click();

    await expect(
      page.getByRole('textbox', {
        name: 'Role in Agency',
      })
    ).toBeVisible({
      timeout: 15000,
    });

    console.log('OTP verification successful.');

    await page.screenshot({
      path: test.info().outputPath('otp-verified.png'),
      fullPage: true,
    });

    
    // PHASE 2: AGENCY DETAILS
    
    await fillAgencyDetails(page);

    await page.screenshot({
      path: test.info().outputPath('agency-details.png'),
      fullPage: true,
    });

    console.log('Agency Details completed.');

    
    // MOVE TO PROFESSIONAL EXPERIENCE
    
    await page.getByRole('button', {
      name: 'Next',
      exact: true,
    }).click();

    
    // PHASE 3: PROFESSIONAL EXPERIENCE
    
    await fillProfessionalExperience(page);

    await page.screenshot({
      path: test.info().outputPath('professional-experience.png'),
      fullPage: true,
    });

    console.log('Professional Experience completed.');
    // Final submission is not performed.

    // PHASE 4: VERIFICATION AND PREFERENCES

    // Move from Professional Experience
    // to Verification and Preferences.
    await page.getByRole('button', {
      name: 'Next',
      exact: true,
    }).click();

    await fillVerificationPreferences(page);

    // Capture the completed page.
    await page.screenshot({
      path: test.info().outputPath('verification-preferences.png'),
      fullPage: true,
    });

    // Confirm final Submit button is available.
    await expect(
      page.getByRole('button', {
        name: 'Submit',
        exact: true,
      })
    ).toBeVisible();

    console.log('Verification and Preferences completed.');


  });
});
