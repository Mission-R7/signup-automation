
import { test, expect } from '@playwright/test';
import 'dotenv/config';

import { fillAgencyDetails } from '../pages/agencyDetails';
import { fillProfessionalExperience } from '../pages/professionalExperience';
import { fillVerificationPreferences } from '../pages/verificationPreferences';

test.describe('Resume Incomplete Signup Workflow', () => {

  test('Login and complete remaining registration steps', async ({ page }) => {

    // Prevent accidental execution.
    test.skip(
      process.env.RUN_RESUME_SIGNUP !== 'true',
      'Resume signup test is disabled in .env'
    );

    const baseURL = process.env.BASE_URL;
    const testEmail = process.env.TEST_EMAIL;
    const testPassword = process.env.TEST_PASSWORD;

    if (!baseURL || !testEmail || !testPassword) {
      throw new Error(
        'BASE_URL, TEST_EMAIL and TEST_PASSWORD must be configured in .env'
      );
    }

  
    // PHASE 1: LOGIN TO EXISTING ACCOUNT
  
    await page.goto(`${baseURL}/login`);

    const emailField = page.getByRole('textbox', {
      name: 'Email',
      exact: true,
    });

    const passwordField = page.getByRole('textbox', {
      name: 'Password',
      exact: true,
    });

    const loginButton = page.getByRole('button', {
      name: 'Log In',
      exact: true,
    });

    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();

    await emailField.fill(testEmail);
    await passwordField.fill(testPassword);

    await loginButton.click();

   
    // PHASE 2: AGENCY DETAILS
    // The existing incomplete account should
    // resume at the Agency Details page.
    await expect(
      page.getByRole('textbox', {
        name: 'Role in Agency',
      })
    ).toBeVisible({
      timeout: 15000,
    });

    console.log('Login successful.');
    console.log('Resumed registration at Agency Details.');

    await fillAgencyDetails(page);

    await page.screenshot({
      path: test.info().outputPath('resumed-agency-details.png'),
      fullPage: true,
    });

    console.log('Agency Details completed.');

    // Advance to Professional Experience.
    await page.getByRole('button', {
      name: 'Next',
      exact: true,
    }).click();

  
    // PHASE 3: PROFESSIONAL EXPERIENCE
  
    await expect(
      page.getByRole('spinbutton', {
        name: 'Number of Students Recruited',
      })
    ).toBeVisible({
      timeout: 15000,
    });

    await fillProfessionalExperience(page);

    await page.screenshot({
      path: test.info().outputPath('resumed-professional-experience.png'),
      fullPage: true,
    });

    console.log('Professional Experience completed.');

    // Advance to Verification and Preferences.
    await page.getByRole('button', {
      name: 'Next',
      exact: true,
    }).click();

    
    // PHASE 4: VERIFICATION AND PREFERENCES

    await expect(
      page.getByRole('textbox', {
        name: 'Business Registration Number',
      })
    ).toBeVisible({
      timeout: 15000,
    });

    await fillVerificationPreferences(page);

    await page.screenshot({
      path: test.info().outputPath('resumed-verification-preferences.png'),
      fullPage: true,
    });

    
    // FINAL VERIFICATION — NO SUBMISSION
    
    const submitButton = page.getByRole('button', {
      name: 'Submit',
      exact: true,
    });

    await expect(submitButton).toBeVisible();

    console.log('All remaining registration pages completed.');
    console.log('Submit button found.');
    console.log('Final submission intentionally not performed.');

  });
});
