
import fs from 'node:fs/promises';
import { google } from 'googleapis';
import 'dotenv/config';

// Reuse the Gmail authorization you already completed.
async function connectToGmail() {
  const savedToken = JSON.parse(
    await fs.readFile('token.json', 'utf8')
  );

 
const auth = new google.auth.OAuth2(
  savedToken.client_id,
  savedToken.client_secret
);

auth.setCredentials({
  refresh_token: savedToken.refresh_token
});


  return google.gmail({
    version: 'v1',
    auth
  });
}

// Gmail email bodies are encoded using Base64URL.
function decodeBody(data) {
  return Buffer.from(data, 'base64url')
    .toString('utf8');
}

// Extract readable text from email message parts.
function getEmailText(part) {
  if (!part) return '';

  let result = '';

  if (part.body?.data &&
      (part.mimeType === 'text/plain' ||
       part.mimeType === 'text/html')) {
    result += decodeBody(part.body.data);
  }

  for (const child of part.parts ?? []) {
    result += '\n' + getEmailText(child);
  }

  return result;
}



export function extractOtp(emailText) {
  const cleanText = emailText
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const patterns = [
    /please use the code below:\s*(\d{6})\b/i,
    /(?:verification code|OTP|one.time password)\s*(?:is|:|-)?\s*(\d{6})\b/i,
    /(?:your code|code)\s*(?:is|:|-)\s*(\d{6})\b/i
  ];

  for (const pattern of patterns) {
    const match = cleanText.match(pattern);

    if (match) {
      return match[1];
    }
  }

  return null;
}



// Wait for a fresh email and return its OTP.
export async function getVerificationCode({
  receivedAfter,
  timeoutMs = 60000
}) {
  const sender = process.env.OTP_SENDER;
  const subject = process.env.OTP_SUBJECT;

  if (!sender || !subject) {
    throw new Error(
      'Set OTP_SENDER and OTP_SUBJECT in .env'
    );
  }

  const gmail = await connectToGmail();
  const deadline = Date.now() + timeoutMs;

  // Search by sender and subject.
  const query = `from:${sender} subject:"${subject}"`;

  while (Date.now() < deadline) {
    const list = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 20
    });

    for (const message of list.data.messages ?? []) {
      const result = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full'
      });

      const email = result.data;

      // Ignore messages received before this test.
      if (Number(email.internalDate) < receivedAfter) {
        continue;
      }

      const text = getEmailText(email.payload);
      const otp = extractOtp(text);

      if (otp) {
        return otp;
      }
    }

    // Wait five seconds before checking again.
    await new Promise(resolve =>
      setTimeout(resolve, 5000)
    );
  }

  throw new Error(
    'No matching verification code received within timeout'
  );
}
