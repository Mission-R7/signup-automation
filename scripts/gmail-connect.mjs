
import fs from 'node:fs/promises';
import path from 'node:path';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly'
];

const CREDENTIALS_PATH = path.resolve('credentials.json');
const TOKEN_PATH = path.resolve('token.json');

// Connect to Gmail using OAuth.
async function authorize() {
  try {
    // Reuse saved authorization when available.
    const saved = JSON.parse(
      await fs.readFile(TOKEN_PATH, 'utf8')
    );

    return google.auth.fromJSON(saved);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  // First-time authorization opens Google's sign-in page.
  const auth = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH
  });

  if (!auth.credentials.refresh_token) {
    throw new Error(
      'No refresh token received. Check OAuth authorization.'
    );
  }

  // Save authorization for future test runs.
  const credentials = JSON.parse(
    await fs.readFile(CREDENTIALS_PATH, 'utf8')
  );

  const client = credentials.installed;

  await fs.writeFile(
    TOKEN_PATH,
    JSON.stringify({
      type: 'authorized_user',
      client_id: client.client_id,
      client_secret: client.client_secret,
      refresh_token: auth.credentials.refresh_token
    }, null, 2),
    { mode: 0o600 }
  );

  return auth;
}

// List a few recent email subjects.
async function checkGmailConnection() {
  const auth = await authorize();

  const gmail = google.gmail({
    version: 'v1',
    auth
  });

  const result = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 5
  });

  const messages = result.data.messages ?? [];

  console.log('Gmail connection successful!');

  for (const message of messages) {
    const details = await gmail.users.messages.get({
      userId: 'me',
      id: message.id,
      format: 'metadata',
      metadataHeaders: ['Subject']
    });

    const subject = details.data.payload?.headers
      ?.find(header =>
        header.name?.toLowerCase() === 'subject'
      )?.value;

    console.log('Email subject:', subject ?? '(none)');
  }
}

checkGmailConnection().catch(error => {
  console.error('Gmail connection failed:', error.message);
  process.exitCode = 1;
});
