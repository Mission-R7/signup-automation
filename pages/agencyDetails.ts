
import { Page, expect } from '@playwright/test';
import { agencyData } from '../test-data/signupData';

export async function fillAgencyDetails(page: Page) {
  // STEP 1: VERIFY AGENCY DETAILS PAGE
  
  const agencyName = page.getByRole('textbox', {
    name: 'Name',
    exact: true,
  });

  const agencyRole = page.getByRole('textbox', {
    name: 'Role in Agency',
  });

  const agencyEmail = page.getByRole('textbox', {
    name: 'Email Address',
  });

  const agencyWebsite = page.getByRole('textbox', {
    name: 'Website',
  });

  const agencyAddress = page.getByRole('textbox', {
    name: 'Address',
    exact: true,
  });

  // Verify that all required Agency Details fields exist.
  await expect(agencyName).toBeVisible();
  await expect(agencyRole).toBeVisible();
  await expect(agencyEmail).toBeVisible();
  await expect(agencyWebsite).toBeVisible();
  await expect(agencyAddress).toBeVisible();

  console.log('Agency Details page loaded.');


  // STEP 2: FILL AGENCY INFORMATION
 

  await agencyName.fill(agencyData.name);
  await agencyRole.fill(agencyData.role);
  await agencyEmail.fill(agencyData.email);
  await agencyWebsite.fill(agencyData.website);
  await agencyAddress.fill(agencyData.address);

  console.log('Agency information entered.');

  // STEP 3: SELECT REGION OF OPERATION
  
  const regionDropdown = page.getByRole('combobox');

  await expect(regionDropdown).toHaveCount(1);
  await expect(regionDropdown).toBeVisible();

  // Open the Region of Operation dropdown.
  await regionDropdown.click();

  const regionDialog = page.getByRole('dialog');

  await expect(regionDialog).toBeVisible();

  // Search for Nepal inside the dropdown.
  const searchInput = regionDialog.getByRole('textbox', {
    name: 'Search...',
  });

  await expect(searchInput).toBeVisible();

  await searchInput.fill(agencyData.region);

  // The trace confirmed that Nepal is rendered
  // as text inside the dialog, not an ARIA option.
  const regionChoice = regionDialog.getByText(
    agencyData.region,
    { exact: true }
  );

  await expect(regionChoice).toHaveCount(1);
  await expect(regionChoice).toBeVisible();

  // Select Nepal.
  await regionChoice.click();

  // STEP 4: VERIFY REGION SELECTION
  // The screenshot confirmed that selected regions
  // appear as tags inside the combobox.
  await expect(regionDropdown).toContainText(
    agencyData.region,
    { timeout: 10000 }
  );

  console.log(
    `Region selected successfully: ${agencyData.region}`
  );

  await page.keyboard.press('Escape');

  // Verify that the dropdown has closed.
  await expect(regionDialog).toBeHidden({
    timeout: 5000,
  });

  
  await expect(regionDropdown).toContainText(
    agencyData.region
  );

  console.log('Region dropdown closed successfully.');

  
  // STEP 5: VERIFY ALL AGENCY FIELDS
  
  await expect(agencyName).toHaveValue(agencyData.name);

  await expect(agencyRole).toHaveValue(agencyData.role);

  await expect(agencyEmail).toHaveValue(agencyData.email);

  await expect(agencyWebsite).toHaveValue(agencyData.website);

  await expect(agencyAddress).toHaveValue(agencyData.address);

  console.log('Agency Details completed successfully.');
}
