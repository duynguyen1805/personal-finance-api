# Firebase Authentication Setup Guide

## Overview
This guide explains how to set up Firebase Authentication for the Personal Finance API, allowing users to sign in with Google and other providers.

## Prerequisites
- Firebase project
- Google Cloud Console access
- Node.js application

## Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Authentication in the Firebase console
4. Add Google as a sign-in provider

### 2. Get Firebase Configuration

#### Backend Configuration (Service Account)
1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the following values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

#### Frontend Configuration (Web App)
1. Go to Project Settings > General
2. Scroll down to "Your apps" section
3. Click the web app icon (</>)
4. Register your app and copy the config values:
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

### 3. Environment Variables
Add the following to your `.env` file:

```env
# Firebase Configuration (Backend)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Firebase Configuration (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### 4. API Endpoints

#### Firebase Login
```http
POST /api/auth/firebase/login
Content-Type: application/json

{
  "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Verify Firebase Token
```http
POST /api/auth/firebase/verify
Content-Type: application/json

{
  "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 5. Frontend Implementation

#### Setup Firebase Client SDK
```javascript
// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
```

#### Google Sign-In Component
```javascript
// components/GoogleSignIn.js
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

const GoogleSignIn = () => {
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Get ID token
      const idToken = await user.getIdToken();
      
      // Send to backend
      const response = await fetch('/api/auth/firebase/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      
      const data = await response.json();
      
      // Store tokens
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // Redirect or update state
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  return (
    <button onClick={handleGoogleSignIn}>
      Sign in with Google
    </button>
  );
};
```

### 6. Security Notes
- Keep your Firebase private key secure
- Never commit Firebase credentials to version control
- Use environment variables for all sensitive data
- Regularly rotate your Firebase service account keys
- Enable Firebase App Check for additional security

### 7. Testing
1. Test Firebase login flow
2. Verify user creation in database
3. Test JWT token generation
4. Test existing user login
5. Test error handling

## Troubleshooting

### Common Issues
1. **"Invalid Firebase token"**: Check Firebase configuration and service account
2. **"User not found"**: Verify user creation logic
3. **"Firebase Admin SDK initialization failed"**: Check environment variables
4. **"Permission denied"**: Verify Firebase project settings

### Debug Steps
1. Check Firebase console logs
2. Verify environment variables
3. Test Firebase Admin SDK initialization
4. Check database connections
5. Review API response logs

## Next Steps
- Add additional providers (Facebook, Apple)
- Implement user profile management
- Add email verification
- Set up Firebase Analytics
- Configure Firebase Security Rules 