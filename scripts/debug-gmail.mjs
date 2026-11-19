
import fs from 'node:fs/promises';
import { google } from 'googleapis';
import 'dotenv/config';

async function debugGmail() {
  // Load existing Gmail authorization
  const token = JSON.parse(
    await fs.readFile('token.json', 'utf8')
  );

  const auth = new google.auth.OAuth2(
    token.client_id,
    token.client_secret
  );

  auth.setCredentials({
    refresh_token: token.refresh_token
  });

  const gmail = google.gmail({
    version: 'v1',
    auth
  });

  // Check which Gmail account is connected
  const profile = await gmail.users.getProfile({
    userId: 'me'
  });

  console.log('Gmail API connection: successful');
  console.log(
    'Expected test inbox connected:',
    profile.data.emailAddress?.toLowerCase() ===
     process.env.TEST_EMAIL?.trim().toLowerCase()

  );

  // Search by sender only, not subject
  const messages = await gmail.users.messages.list({
    userId: 'me',
    q: 'from:no-reply@theauthorizedpartner.com',
    maxResults: 20
  });

  const found = messages.data.messages ?? [];

  console.log('Matching emails found:', found.length);

  for (const message of found) {
    const result = await gmail.users.messages.get({
      userId: 'me',
      id: message.id,
      format: 'metadata',
      metadataHeaders: ['Subject']
    });

    const subject = result.data.payload?.headers
      ?.find(h => h.name?.toLowerCase() === 'subject')
      ?.value;

    console.log('---');
    console.log('Subject:', subject);
    console.log(
      'Received:',
      new Date(Number(result.data.internalDate))
        .toISOString()
    );
  }
}

debugGmail().catch(error => {
  console.error('Error:', error.message);
  process.exitCode = 1;
});
