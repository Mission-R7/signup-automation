
import { getVerificationCode } from '../helpers/gmailOtp.mjs';

// Search for a matching email from the last 24 hours.
const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

try {
  const otp = await getVerificationCode({
    receivedAfter: oneDayAgo,
    timeoutMs: 30000
  });

  // Don't display the actual OTP in the terminal.
  console.log('OTP extracted successfully!');
  console.log('OTP length:', otp.length);

} catch (error) {
  console.error('OTP test failed:', error.message);
  process.exitCode = 1;
}
