# Mailer V2 Migration Guide

## Overview
This guide explains the migration from `mailer.ts` to `mailer-v2.ts` with Google App Mail integration.

## Changes Made

### 1. Files Modified

#### `src/common/email-helpers/mailer-v2.ts`
- **Commented out old imports**: Postmark, SendGrid, and nodemailer imports are now commented
- **Added Google App Mail import**: New import for GoogleAppMail helper
- **Updated EmailGenerator**: Enhanced template path resolution with multiple fallbacks
- **Added GoogleAppMailV2 class**: New email sender using Google App Mail
- **Updated Mailer class**: Modified to use Google App Mail by default

#### `src/modules/auth/auth.module.ts`
- **Updated import**: Changed from `mailer` to `mailer-v2`
- **Removed Mailer provider**: No longer needed as Mailer uses static methods

#### `src/modules/auth/auth.service.ts`
- **Updated import**: Changed from `mailer` to `mailer-v2`
- **Removed Mailer injection**: No longer injects Mailer instance
- **Updated method calls**: Changed to use static methods

#### `src/modules/auth/use-cases/sign-up.use-case.ts`
- **Updated import**: Changed from `mailer` to `mailer-v2`
- **Removed Mailer injection**: No longer injects Mailer instance
- **Updated method calls**: Changed to use `Mailer.sendRegistrationConfirmationEmail`

#### `src/modules/auth/use-cases/resend-verify-registration.use-case.ts`
- **Updated import**: Changed from `mailer` to `mailer-v2`
- **Removed Mailer injection**: No longer injects Mailer instance
- **Updated method calls**: Changed to use `Mailer.sendRegistrationConfirmationEmail`

### 2. Key Differences

#### Before (mailer.ts)
```typescript
// Instance-based usage
constructor(private readonly mailer: Mailer) {}

await this.mailer.send(
  'Subject',
  user,
  EEmailTemplate.REGISTRATION_CONFIRMATION,
  { code: '123456' }
);
```

#### After (mailer-v2.ts)
```typescript
// Static method usage
// No injection needed

await Mailer.sendRegistrationConfirmationEmail(
  userId,
  { code: '123456', email: 'user@example.com' }
);
```

### 3. Email Provider Changes

#### Before
- SendGrid (default)
- SMTP (commented out)
- Postmark (available)

#### After
- Google App Mail (default)
- SendGrid (commented out)
- SMTP (commented out)
- Postmark (commented out)

### 4. Template Path Resolution

#### Enhanced EmailGenerator
- Multiple path fallbacks for template files
- Better error handling and logging
- Support for both development and production environments

```typescript
private static getTemplatePath(template: string): string {
  const possiblePaths = [
    path.join(process.cwd(), 'templates', 'email', `${template}.ejs`),
    path.join(process.cwd(), 'dist', 'templates', 'email', `${template}.ejs`),
    // ... more fallbacks
  ];
  // ... path resolution logic
}
```

## Migration Steps

### 1. Update Imports
Change all imports from:
```typescript
import { Mailer, EEmailTemplate } from '../../common/email-helpers/mailer';
```
To:
```typescript
import { Mailer, EEmailTemplate } from '../../common/email-helpers/mailer-v2';
```

### 2. Remove Mailer Injection
Remove Mailer from constructor and providers:
```typescript
// Before
constructor(private readonly mailer: Mailer) {}

// After
constructor() {}
```

### 3. Update Method Calls
Change from instance methods to static methods:

#### Registration Email
```typescript
// Before
await this.mailer.send(
  'Subject',
  user,
  EEmailTemplate.REGISTRATION_CONFIRMATION,
  { code }
);

// After
await Mailer.sendRegistrationConfirmationEmail(
  user.id,
  { code, email: user.email }
);
```

#### Direct Email
```typescript
// Before
await this.mailer.send(
  'Subject',
  user,
  EEmailTemplate.OTP_TWO_FA,
  { code, email }
);

// After
await Mailer.sendDirectEmail(
  email,
  EEmailTemplate.OTP_TWO_FA,
  { code, email }
);
```

### 4. Update Module Configuration
Remove Mailer from providers in modules:
```typescript
// Before
providers: [
  // ... other providers
  Mailer,
]

// After
providers: [
  // ... other providers
  // Mailer, // No longer needed
]
```

## Benefits of Migration

### 1. Better Email Provider
- Google App Mail integration
- OAuth 2.0 authentication
- Better deliverability
- Cost effective

### 2. Simplified Usage
- Static methods (no injection needed)
- Cleaner code
- Better separation of concerns

### 3. Enhanced Template Handling
- Multiple path fallbacks
- Better error messages
- Support for different environments

### 4. Improved Error Handling
- Detailed error messages
- Template path logging
- Better debugging capabilities

## Testing

### 1. Unit Tests
```bash
npm test mailer-v2.spec.ts
```

### 2. Integration Tests
Test the sign-up flow:
```bash
# Test registration
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. Template Path Test
```bash
node scripts/test-template-path.js
```

## Troubleshooting

### Common Issues

#### 1. "Template file not found"
**Solution**: Ensure templates are copied to dist folder
```bash
npm run build
```

#### 2. "Cannot find name 'Mailer'"
**Solution**: Check import path is correct
```typescript
import { Mailer, EEmailTemplate } from '../../common/email-helpers/mailer-v2';
```

#### 3. "Property 'send' does not exist"
**Solution**: Use static methods instead of instance methods
```typescript
// Wrong
await this.mailer.send(...)

// Correct
await Mailer.sendRegistrationConfirmationEmail(...)
```

### Debug Steps

#### 1. Check Template Paths
```bash
node scripts/test-template-path.js
```

#### 2. Verify Build Output
```bash
ls -la dist/templates/email/
```

#### 3. Check Environment Variables
```bash
echo $EMAIL_PROVIDER
echo $GMAIL_USER
```

## Rollback Plan

If you need to rollback to mailer.ts:

### 1. Revert Imports
```typescript
import { Mailer, EEmailTemplate } from '../../common/email-helpers/mailer';
```

### 2. Restore Injection
```typescript
constructor(private readonly mailer: Mailer) {}
```

### 3. Restore Method Calls
```typescript
await this.mailer.send(...)
```

### 4. Update Module Configuration
```typescript
providers: [
  // ... other providers
  Mailer,
]
```

## Environment Variables

Ensure these environment variables are set:
```env
EMAIL_PROVIDER=GOOGLE_APP_MAIL
GMAIL_USER=your-email@gmail.com
GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
GMAIL_ACCESS_TOKEN=your-access-token
```

## Conclusion

The migration to mailer-v2.ts provides:
- ✅ Google App Mail integration
- ✅ Simplified usage with static methods
- ✅ Enhanced template handling
- ✅ Better error handling
- ✅ No breaking changes to existing functionality

The system is now ready for production use with Google App Mail as the primary email provider. 