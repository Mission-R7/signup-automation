
import { Page, expect } from '@playwright/test';
import { verificationPreferencesData } from '../test-data/signupData';

export async function fillVerificationPreferences(page: Page) {

  
  // STEP 1: VERIFY THE PAGE
  

  const registrationNumber = page.getByRole('textbox', {
    name: 'Business Registration Number',
  });

  const preferredCountries = page.getByRole('combobox', {
    name: 'Preferred Countries',
  });

  const certificationDetails = page.getByRole('textbox', {
    name: /Certification Details/i,
  });

  await expect(registrationNumber).toBeVisible();
  await expect(preferredCountries).toBeVisible();
  await expect(certificationDetails).toBeVisible();

  console.log('Verification and Preferences page loaded.');

  
  // STEP 2: BUSINESS REGISTRATION NUMBER
  

  await registrationNumber.fill(
    verificationPreferencesData.businessRegistrationNumber
  );

  await expect(registrationNumber).toHaveValue(
    verificationPreferencesData.businessRegistrationNumber
  );

  console.log('Business Registration Number entered.');

  
  // STEP 3: PREFERRED COUNTRIES
  

  const countries = verificationPreferencesData.preferredCountries;

  if (countries.length === 0) {
    throw new Error(
      'Preferred Countries is empty. Add a valid country ' +
      'to test-data/signupData.ts before running live signup.'
    );
  }

  for (const country of countries) {

    // Open the dropdown.
    await preferredCountries.click();

    // Wait until the dropdown is expanded.
    await expect(preferredCountries).toHaveAttribute(
      'aria-expanded',
      'true'
    );

    // Different components expose country choices differently.
    const countryDialog = page.getByRole('dialog');

    if (await countryDialog.isVisible()) {

      // Search inside the dialog when supported.
      const searchInput = countryDialog.getByRole('textbox', {
        name: 'Search...',
      });

      if (await searchInput.count() === 1) {
        await searchInput.fill(country);
      }

      const countryText = countryDialog.getByText(country, {
        exact: true,
      });

      await expect(countryText).toBeVisible({
        timeout: 10000,
      });

      await countryText.click();

    } else {

      // Some dropdown components expose choices as options.
      const countryOption = page.getByRole('option', {
        name: country,
        exact: true,
      });

      await expect(countryOption).toBeVisible({
        timeout: 10000,
      });

      await countryOption.click();
    }

    // Confirm that the selected country appears in the control.
    await expect(preferredCountries).toContainText(country);

    console.log(`Preferred country verified: ${country}`);
  }

  
  // STEP 4: INSTITUTION TYPES
  

  for (const institution of verificationPreferencesData.institutionTypes) {

    const checkbox = page.getByRole('checkbox', {
      name: institution,
      exact: true,
    });

    await expect(checkbox).toBeVisible();

    // Ensure selected without toggling off.
    await checkbox.check();

    await expect(checkbox).toBeChecked();

    console.log(`Institution selected: ${institution}`);
  }

  
  // STEP 5: CERTIFICATION DETAILS
  

  await certificationDetails.fill(
    verificationPreferencesData.certificationDetails
  );

  
  // STEP 6: FINAL ASSERTIONS


  await expect(registrationNumber).toHaveValue(
    verificationPreferencesData.businessRegistrationNumber
  );

  await expect(certificationDetails).toHaveValue(
    verificationPreferencesData.certificationDetails
  );

  for (const institution of verificationPreferencesData.institutionTypes) {
    await expect(
      page.getByRole('checkbox', {
        name: institution,
        exact: true,
      })
    ).toBeChecked();
  }

  console.log('Verification and Preferences completed successfully.');
}
