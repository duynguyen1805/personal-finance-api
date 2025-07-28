const { google } = require('googleapis');
require('dotenv').config();

async function testGoogleOAuth() {
  try {
    console.log('Testing Google OAuth2 configuration...');
    
    // Lấy config từ environment variables
    const configs = {
      gmailUser: process.env.GMAIL_USER,
      gmailClientId: process.env.GMAIL_CLIENT_ID,
      gmailClientSecret: process.env.GMAIL_CLIENT_SECRET,
      gmailRefreshToken: process.env.GMAIL_REFRESH_TOKEN,
      gmailAccessToken: process.env.GMAIL_ACCESS_TOKEN
    };

    console.log('Config check:');
    console.log('- GMAIL_USER:', configs.gmailUser ? '✓ Set' : '✗ Missing');
    console.log('- GMAIL_CLIENT_ID:', configs.gmailClientId ? '✓ Set' : '✗ Missing');
    console.log('- GMAIL_CLIENT_SECRET:', configs.gmailClientSecret ? '✓ Set' : '✗ Missing');
    console.log('- GMAIL_REFRESH_TOKEN:', configs.gmailRefreshToken ? '✓ Set' : '✗ Missing');
    console.log('- GMAIL_ACCESS_TOKEN:', configs.gmailAccessToken ? '✓ Set' : '✗ Missing');

    // Tạo OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      configs.gmailClientId,
      configs.gmailClientSecret,
      'https://developers.google.com/oauthplayground'
    );

    // Set credentials
    oauth2Client.setCredentials({
      refresh_token: configs.gmailRefreshToken,
      access_token: configs.gmailAccessToken
    });

    // Test refresh token
    console.log('\nTesting refresh token...');
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      console.log('✓ Refresh token is valid');
      console.log('✓ New access token received:', credentials.access_token ? 'Yes' : 'No');
    } catch (error) {
      console.error('✗ Refresh token test failed:', error.message);
      console.log('\nPossible solutions:');
      console.log('1. Check if your refresh token is valid');
      console.log('2. Make sure your Google App has the correct scopes');
      console.log('3. Verify your client ID and client secret');
      console.log('4. Check if your Google App is properly configured');
    }

    // Test Gmail API
    console.log('\nTesting Gmail API access...');
    try {
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      const response = await gmail.users.getProfile({ userId: 'me' });
      console.log('✓ Gmail API access successful');
      console.log('✓ User email:', response.data.emailAddress);
    } catch (error) {
      console.error('✗ Gmail API test failed:', error.message);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testGoogleOAuth(); 