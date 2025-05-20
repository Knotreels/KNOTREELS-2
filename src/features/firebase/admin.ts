import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App | undefined;

export function getAdminApp(): App {
  if (!app) {
    const serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON!);
    app = initializeApp({ credential: cert(serviceAccount) });
  }
  return app!;
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
