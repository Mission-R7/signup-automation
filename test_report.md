
# QA Automation Test Report

**Project:** Authorized Partner Signup Automation  
**Framework:** Playwright + TypeScript  
**Browser:** Chromium  
**Test Date:** 19 November 2026  
**Execution Type:** Automated UI Testing

## 1. Objective

Validate the signup process, including form input,
Gmail OTP verification, navigation, dropdown selection,
and completion of registration details.

## 2. Test Results

| Test Scenario | Result |
|---|---|
| Registration page availability | PASS |
| Account Setup field validation | PASS |
| Password mismatch validation | PASS |
| Invalid email format | PASS |
| Empty required fields | PASS |
| Automatic Gmail OTP verification | PASS |
| Agency Details completion | PASS |
| Nepal region selection | PASS |
| Professional Experience completion | PASS |
| Services Offered selection | PASS |
| Preferred Countries selection | PASS |
| Institution Types selection | PASS |
| Verification and Preferences completion | PASS |
| Final Submit button visibility | PASS |
| Final registration submission | NOT TESTED |
| Post-submission confirmation | NOT TESTED |

## 3. Execution Summary

**Account validation run**
- 6 passed
- 1 skipped

**Resume-registration run**
- 1 passed
- Total time: 20.1 seconds

**Signup-from-start run**
- 1 passed
- Total time: 26.9 seconds

These results came from separate executions.

## 4. Observations

- Gmail OTP was retrieved and entered automatically.
- Multi-select Region of Operation required explicit
  dropdown closing.
- The application retained an email after OTP
  verification, even with incomplete registration.
- Login allowed an incomplete account to resume
  from Agency Details.
- The full signup-from-start test successfully
  reached the final Submit button.

## 5. Limitations

The automated workflow did not click Submit.
Successful final account creation and the
post-submission confirmation were not verified.

## 6. Conclusion

The automated workflow successfully validated form
progression from Account Setup through Verification
and Preferences in Chromium, including Gmail OTP
verification without manual intervention.

Final registration submission remains untested.
