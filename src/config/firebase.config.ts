import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
// import "firebase/compat/firestore";
// import "firebase/compat/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { initializeApp } from '@firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import * as admin from 'firebase-admin';
import { configService } from './config.service';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase for client-side
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
export { auth, firebase };

export const app = initializeApp(firebaseConfig);
// export const auth = getAuth();
export const storage = getStorage(app);
export const db = getFirestore(app);

// Initialize Firebase Admin SDK for server-side
if (!admin.apps.length) {
  try {
    const firebaseConfig = configService.getFirebaseConfig();
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: firebaseConfig.projectId,
        privateKey: firebaseConfig.privateKey?.replace(/\\n/g, '\n'),
        clientEmail: firebaseConfig.clientEmail
      }),
      databaseURL: firebaseConfig.databaseURL
    });
  } catch (error) {
    console.warn('Firebase Admin SDK initialization failed:', error.message);
    console.warn('Firebase authentication will not work without proper configuration');
  }
}

export const adminAuth = admin.auth();
