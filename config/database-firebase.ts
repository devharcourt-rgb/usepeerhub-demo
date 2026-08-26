import * as admin from 'firebase-admin';
import path from 'path';

const serviceAccountPath = path.join(__dirname, './firebase-config.json');

const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

export const firebaseAdmin = admin;
