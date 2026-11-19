
import { test, expect } from '@playwright/test';
import { testData } from '../test-data/signupData';

test('Fill account setup using reusable test data', async ({ page }) => {

  // STEP 1: Open the signup website
  await page.goto(
    'https://authorized-partner.vercel.app/register'
  );

  // STEP 2: Accept the terms
  await page.getByRole('checkbox', {
    name: 'I agree to the Terms of'
  }).check();

  // STEP 3: Open account setup
  await page.getByRole('button', {
    name: 'Continue'
  }).click();

  // STEP 4: Fill account details
  await page.getByRole('textbox', {
    name: 'First Name'
  }).fill(testData.firstName);

  await page.getByRole('textbox', {
    name: 'Last Name'
  }).fill(testData.lastName);

  await page.getByRole('textbox', {
    name: 'Email Address'
  }).fill(testData.email);

  await page.getByRole('textbox', {
    name: 'Phone Number'
  }).fill(testData.phone);

  // STEP 5: Verify fields contain expected values
  await expect(
    page.getByRole('textbox', { name: 'First Name' })
  ).toHaveValue(testData.firstName);

  await expect(
    page.getByRole('textbox', { name: 'Last Name' })
  ).toHaveValue(testData.lastName);

  await expect(
    page.getByRole('textbox', { name: 'Email Address' })
  ).toHaveValue(testData.email);

  await expect(
    page.getByRole('textbox', { name: 'Phone Number' })
  ).toHaveValue(testData.phone);

  // STEP 6: Capture evidence
  await page.screenshot({
    path: test.info().outputPath('account-form.png'),
    fullPage: true
  });

});
