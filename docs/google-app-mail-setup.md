# Google App Mail Setup Guide

## Overview
This guide explains how to set up Google App Mail for sending emails through the Personal Finance API.

## Prerequisites
- Google Cloud Console account
- Gmail account
- Node.js application with nodemailer

## Setup Steps

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Gmail API for your project

### 2. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as application type
4. Add authorized redirect URIs (if needed)
5. Note down the Client ID and Client Secret

### 3. Generate Refresh Token
1. Use Google OAuth 2.0 Playground: https://developers.google.com/oauthplayground/
2. Click the settings icon (⚙️) in the top right
3. Check "Use your own OAuth credentials"
4. Enter your Client ID and Client Secret
5. Close settings
6. Select "Gmail API v1" > "https://mail.google.com/"
7. Click "Authorize APIs"
8. Sign in with your Gmail account
9. Click "Exchange authorization code for tokens"
10. Copy the Refresh Token

### 4. Environment Variables
Add the following environment variables to your `.env` file:

```env
# Email Provider Configuration
EMAIL_PROVIDER=GOOGLE_APP_MAIL
IS_SEND_EMAIL=true
SENDER_NAME=Your App Name

# Google App Mail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
GMAIL_ACCESS_TOKEN=your-access-token
```

### 5. Security Notes
- Keep your Client Secret and Refresh Token secure
- Never commit these values to version control
- Use environment variables or secure secret management
- Regularly rotate your tokens

### 6. Testing
To test the setup, you can use the existing email templates:
- Registration confirmation
- OTP for two-factor authentication
- Password reset

## Troubleshooting

### Common Issues
1. **"Invalid Credentials"**: Check your Client ID and Client Secret
2. **"Invalid Refresh Token"**: Generate a new refresh token
3. **"Access Denied"**: Ensure Gmail API is enabled in your Google Cloud project
4. **"Quota Exceeded"**: Check your Gmail API quotas in Google Cloud Console

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

## API Usage
The Google App Mail is now integrated into the existing Mailer class. Usage remains the same:

```typescript
// In your service
constructor(private readonly mailer: Mailer) {}

// Send email
await this.mailer.send(
  'Subject',
  user,
  EEmailTemplate.REGISTRATION_CONFIRMATION,
  { code: '123456' }
);
```

## Migration from Other Providers
The system automatically uses Google App Mail when `EMAIL_PROVIDER=GOOGLE_APP_MAIL` is set. No code changes are required in existing services. 