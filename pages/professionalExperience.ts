
import { Page, expect } from '@playwright/test';
import { professionalExperienceData } from '../test-data/signupData';

export async function fillProfessionalExperience(page: Page) {


  // STEP 1: VERIFY PROFESSIONAL EXPERIENCE PAGE

  const studentsRecruited = page.getByRole('spinbutton', {
    name: 'Number of Students Recruited',
  });

  const focusArea = page.getByRole('textbox', {
    name: 'Focus Area',
  });

  const successMetrics = page.getByRole('spinbutton', {
    name: 'Success Metrics',
  });

  await expect(studentsRecruited).toBeVisible();
  await expect(focusArea).toBeVisible();
  await expect(successMetrics).toBeVisible();

  console.log('Professional Experience page loaded.');


  // STEP 2: SELECT YEARS OF EXPERIENCE

  const experienceValue =
    professionalExperienceData.yearsOfExperience;

  // Check for a native HTML <select>.
  const nativeSelect = page.locator('select').filter({
    has: page.getByRole('option', {
      name: experienceValue,
      exact: true,
    }),
  });

  if (await nativeSelect.count() === 1) {

    // Native HTML dropdown.
    await nativeSelect.selectOption({
      label: experienceValue,
    });

    // Verify the selected option's actual label.
    const selectedLabel = await nativeSelect
      .locator('option:checked')
      .textContent();

    expect(selectedLabel?.trim()).toBe(experienceValue);

    console.log(
      `Native experience dropdown selected: ${experienceValue}`
    );

  } else {

    // Custom dropdown.
    const experienceOption = page.getByRole('option', {
      name: experienceValue,
      exact: true,
    });

    // If the option isn't visible, try opening its dropdown.
    if (!(await experienceOption.isVisible())) {

      const experienceDropdown = page.getByRole('combobox', {
        name: /years of experience/i,
      });

      if (await experienceDropdown.count() === 1) {

        await experienceDropdown.click();

      } else {

        throw new Error(
          'Years of Experience dropdown could not be identified. ' +
          'The option is not visible, and no uniquely labeled ' +
          'combobox was found. Inspect the Playwright trace.'
        );
      }
    }

    // Option-based dropdown.
    if (await experienceOption.isVisible()) {

      await experienceOption.click();

    } else {

      // Dialog-based dropdown.
      const experienceDialog = page.getByRole('dialog');

      await expect(experienceDialog).toBeVisible();

      const experienceText = experienceDialog.getByText(
        experienceValue,
        { exact: true }
      );

      await expect(experienceText).toBeVisible();
      await experienceText.click();
    }

    // Verify that the selected value appears on the page.
    const selectedExperience = page.getByText(
      experienceValue,
      { exact: true }
    );

    await expect(selectedExperience.first()).toBeVisible();

    console.log(
      `Custom experience dropdown selected: ${experienceValue}`
    );
  }


  // STEP 3: FILL EXPERIENCE DETAILS
 
  await studentsRecruited.fill(
    professionalExperienceData.studentsRecruited
  );

  await focusArea.fill(
    professionalExperienceData.focusArea
  );

  await successMetrics.fill(
    professionalExperienceData.successMetrics
  );

  console.log('Professional Experience fields entered.');


  // STEP 4: SELECT SERVICES OFFERED
 
  for (const service of professionalExperienceData.servicesOffered) {

    const serviceCheckbox = page.getByRole('checkbox', {
      name: service,
      exact: true,
    });

    await expect(serviceCheckbox).toBeVisible();

    await serviceCheckbox.check();

    await expect(serviceCheckbox).toBeChecked();

    console.log(`Selected service: ${service}`);
  }


  // STEP 5: VERIFY ENTERED INFORMATION

  await expect(studentsRecruited).toHaveValue(
    professionalExperienceData.studentsRecruited
  );

  await expect(focusArea).toHaveValue(
    professionalExperienceData.focusArea
  );

  await expect(successMetrics).toHaveValue(
    professionalExperienceData.successMetrics
  );

  for (const service of professionalExperienceData.servicesOffered) {

    await expect(
      page.getByRole('checkbox', {
        name: service,
        exact: true,
      })
    ).toBeChecked();
  }

  console.log('Professional Experience completed successfully.');
}
