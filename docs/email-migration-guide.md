# Email Migration Guide - Google App Mail Integration

## Overview
This guide explains the migration from existing email providers (SMTP, SendGrid) to Google App Mail in the Personal Finance API.

## Changes Made

### 1. New Files Created
- `src/common/email-helpers/google-app-mail.helper.ts` - Google App Mail implementation
- `src/common/email-helpers/google-app-mail.helper.spec.ts` - Unit tests
- `src/common/email-helpers/google-app-mail-example.ts` - Usage examples
- `docs/google-app-mail-setup.md` - Setup guide
- `docs/email-migration-guide.md` - This migration guide

### 2. Files Modified

#### `src/config/config.service.ts`
- Added Google App Mail configuration properties:
  - `gmailUser`
  - `gmailClientId`
  - `gmailClientSecret`
  - `gmailRefreshToken`
  - `gmailAccessToken`
- Added required environment variables to `ensureValues`

#### `src/common/email-helpers/mailer.ts`
- **Commented out old imports**: SMTP and SendGrid imports are now commented
- **Added Google App Mail import**: New import for GoogleAppMail helper
- **Updated EEmailProvider enum**: Added `GOOGLE_APP_MAIL` option
- **Modified Mailer class**: 
  - Commented out old SMTP and SendGrid properties
  - Added GoogleAppMail property
  - Updated constructor to initialize GoogleAppMail
  - Modified send method to use Google App Mail by default

### 3. Code Changes Summary

#### Before (Old Implementation)
```typescript
// Old imports
import { Sendgrid } from './sendgrid.helper';
import { SMTP } from './smtp.helper';

export class Mailer {
  private smtp: SMTP;
  private sendgrid: Sendgrid;

  public constructor() {
    this.smtp = new SMTP();
    this.sendgrid = new Sendgrid();
  }

  async send(...) {
    // switch (configs.emailProvider) {
    //   case EEmailProvider.SENDGRID:
    //     return this.sendgrid.process(emailInput);
    //   case EEmailProvider.SMTP:
    //     return this.smtp.process(emailInput);
    // }
  }
}
```

#### After (New Implementation)
```typescript
// New imports (old ones commented)
// import { Sendgrid } from './sendgrid.helper';
// import { SMTP } from './smtp.helper';
import { GoogleAppMail } from './google-app-mail.helper';

export class Mailer {
  // private smtp: SMTP;
  // private sendgrid: Sendgrid;
  private googleAppMail: GoogleAppMail;

  public constructor() {
    // this.smtp = new SMTP();
    // this.sendgrid = new Sendgrid();
    this.googleAppMail = new GoogleAppMail();
  }

  async send(...) {
    switch (configs.emailProvider) {
      case EEmailProvider.GOOGLE_APP_MAIL:
        return this.googleAppMail.process(emailInput);
      // case EEmailProvider.SENDGRID:
      //   return this.sendgrid.process(emailInput);
      // case EEmailProvider.SMTP:
      //   return this.smtp.process(emailInput);
      default:
        return this.googleAppMail.process(emailInput);
    }
  }
}
```

## Migration Steps

### 1. Environment Setup
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

### 2. Google Cloud Setup
Follow the detailed setup guide in `docs/google-app-mail-setup.md` to:
- Create Google Cloud project
- Enable Gmail API
- Create OAuth 2.0 credentials
- Generate refresh token

### 3. Code Changes
No changes required in existing services! The Mailer class maintains the same interface:

```typescript
// This code continues to work without changes
await this.mailer.send(
  'Subject',
  user,
  EEmailTemplate.REGISTRATION_CONFIRMATION,
  { code: '123456' }
);
```

## Benefits of Migration

### 1. Better Deliverability
- Google App Mail has excellent deliverability rates
- Emails are less likely to be marked as spam
- Better integration with Gmail ecosystem

### 2. Simplified Configuration
- Single OAuth 2.0 setup
- No need for SMTP credentials
- Automatic token refresh

### 3. Enhanced Security
- OAuth 2.0 authentication
- No password storage required
- Secure token-based access

### 4. Cost Effective
- Free tier available
- No additional service costs
- Integrated with Google Workspace

## Rollback Plan

If you need to rollback to previous email providers:

### 1. Revert Environment Variables
```env
EMAIL_PROVIDER=SENDGRID  # or SMTP
```

### 2. Uncomment Old Code
In `src/common/email-helpers/mailer.ts`:
- Uncomment SMTP and SendGrid imports
- Uncomment old properties and constructor code
- Uncomment old switch cases

### 3. Remove Google App Mail
- Remove GoogleAppMail import and property
- Remove Google App Mail case from switch statement

## Testing

### 1. Unit Tests
Run the new unit tests:
```bash
npm test google-app-mail.helper.spec.ts
```

### 2. Integration Tests
Test email sending functionality:
```typescript
// Use the example in google-app-mail-example.ts
const googleAppMailExample = new GoogleAppMailExample(mailer);
await googleAppMailExample.sendRegistrationEmail(user, '123456');
```

### 3. Environment Testing
Test with different environment configurations:
- Development: `NODE_ENV=development`
- Production: `NODE_ENV=production`

## Troubleshooting

### Common Issues
1. **"Invalid Credentials"**: Check Google Cloud OAuth setup
2. **"Quota Exceeded"**: Check Gmail API quotas
3. **"Access Denied"**: Verify Gmail API is enabled

### Debug Mode
Enable debug logging:
```env
NODE_ENV=development
```

## Support

For additional support:
1. Check `docs/google-app-mail-setup.md` for detailed setup instructions
2. Review `src/common/email-helpers/google-app-mail-example.ts` for usage examples
3. Run unit tests to verify functionality
4. Check Google Cloud Console for API quotas and errors 