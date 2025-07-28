const { google } = require('googleapis');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function getRefreshToken() {
  try {
    console.log('=== Google OAuth2 Refresh Token Generator ===\n');
    
    // Lấy thông tin từ user
    const clientId = await question('Enter your Client ID: ');
    const clientSecret = await question('Enter your Client Secret: ');
    const redirectUri = 'https://developers.google.com/oauthplayground';
    
    // Tạo OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
    
    // Tạo authorization URL
    const scopes = [
      'https://mail.google.com/',
      'https://www.googleapis.com/auth/gmail.send'
    ];
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
    
    console.log('\n=== Authorization URL ===');
    console.log(authUrl);
    console.log('\n1. Copy và paste URL trên vào browser');
    console.log('2. Authorize ứng dụng');
    console.log('3. Copy authorization code từ URL redirect');
    
    const authCode = await question('\nEnter the authorization code: ');
    
    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(authCode);
    
    console.log('\n=== Tokens Generated ===');
    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token);
    console.log('Token Type:', tokens.token_type);
    console.log('Expires In:', tokens.expires_in);
    
    console.log('\n=== Environment Variables ===');
    console.log('GMAIL_CLIENT_ID=' + clientId);
    console.log('GMAIL_CLIENT_SECRET=' + clientSecret);
    console.log('GMAIL_REFRESH_TOKEN=' + tokens.refresh_token);
    console.log('GMAIL_ACCESS_TOKEN=' + tokens.access_token);
    
    console.log('\n=== Next Steps ===');
    console.log('1. Copy các giá trị trên vào file .env');
    console.log('2. Test cấu hình bằng: node scripts/test-google-oauth.js');
    console.log('3. Restart ứng dụng');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Kiểm tra Client ID và Client Secret');
    console.log('2. Đảm bảo Gmail API đã được enable');
    console.log('3. Kiểm tra redirect URI trong Google Cloud Console');
  } finally {
    rl.close();
  }
}

getRefreshToken(); 