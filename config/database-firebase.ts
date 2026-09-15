import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

// The service account JSON is kept out of the repo (it's a private key) and
// passed in as a base64-encoded env var instead. Generate it with:
//   base64 -w0 config/firebase-config.json   (Linux/macOS)
//   certutil -encode config/firebase-config.json tmp.b64  (Windows, then strip header/footer lines)
const FIREBASE_SERVICE_ACCOUNT_BASE64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (!FIREBASE_SERVICE_ACCOUNT_BASE64) {
  throw new Error(
    'FIREBASE_SERVICE_ACCOUNT_BASE64 env var is not set. Base64-encode your Firebase service account JSON and set it as this env var.',
  );
}

const serviceAccount = JSON.parse(
  Buffer.from(FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8'),
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const firebaseAdmin = admin;
