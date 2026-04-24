import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './config/firebase-service-account.json';

let firebaseStatus = 'NOT_INITIALIZED';

if (serviceAccountJson) {
    try {
        let cleanedJson = serviceAccountJson.trim();
        
        // Remove wrap-around quotes if they exist
        if ((cleanedJson.startsWith("'") && cleanedJson.endsWith("'")) || 
            (cleanedJson.startsWith('"') && cleanedJson.endsWith('"'))) {
            cleanedJson = cleanedJson.slice(1, -1);
        }

        // Specifically handle common newline escaping issues in .env strings
        cleanedJson = cleanedJson.replace(/\\n/g, '\n');
        
        const serviceAccount = JSON.parse(cleanedJson);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        firebaseStatus = 'INITIALIZED_FROM_JSON_STRING';
        console.log('>>> Firebase Admin successfully initialized.');
    } catch (error) {
        firebaseStatus = 'ERROR_JSON_PARSE_FAILED';
        console.error('!!! Firebase JSON Error:', error.message);
    }
} else if (fs.existsSync(serviceAccountPath)) {
    try {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        firebaseStatus = 'INITIALIZED_FROM_FILE';
        console.log('Firebase Admin SDK initialized successfully from file.');
    } catch (error) {
        firebaseStatus = 'ERROR_FILE_PARSE_FAILED';
        console.error('Failed to parse service account file:', error.message);
    }
} else {
    firebaseStatus = 'MISSING_CREDENTIALS';
    console.warn(`Firebase service account not found (no JSON string or file at ${serviceAccountPath}). Authentication will fail.`);
}

export const getFirebaseStatus = () => firebaseStatus;
export default admin;
