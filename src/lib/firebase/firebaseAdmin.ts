import admin from 'firebase-admin';
import serviceAccount from '../../../serviceAccountKey.json';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
}

export const authAdmin = admin.auth();
export const db = admin.firestore();
