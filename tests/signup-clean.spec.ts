
import { test, expect } from '@playwright/test';

test('Verify signup account setup page', async ({ page }) => {

  // 1. Open the registration page
  await page.goto(
    'https://authorized-partner.vercel.app/register'
  );

  // 2. Accept the terms and conditions
  await page.getByRole('checkbox', {
    name: 'I agree to the Terms of'
  }).check();

  // 3. Proceed to account setup
  await page.getByRole('button', {
    name: 'Continue'
  }).click();

  // 4. Verify the important fields exist
  await expect(
    page.getByRole('textbox', { name: 'First Name' })
  ).toBeVisible();

  await expect(
    page.getByRole('textbox', { name: 'Last Name' })
  ).toBeVisible();

  await expect(
    page.getByRole('textbox', {
      name: 'Email Address'
    })
  ).toBeVisible();

  await expect(
    page.getByRole('textbox', {
      name: 'Phone Number'
    })
  ).toBeVisible();

  await expect(
    page.locator('input[name="password"]')
  ).toBeVisible();

  await expect(
    page.locator('input[name="confirmPassword"]')
  ).toBeVisible();

  // 5. Save evidence
  await page.screenshot({
    path: 'account-setup.png',
    fullPage: true
  });

});
