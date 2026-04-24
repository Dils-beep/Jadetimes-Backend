import express from 'express';
import pool from '../config/db.js';
import { getFirebaseStatus } from '../config/firebase.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const healthInfo = {
        timestamp: new Date().toISOString(),
        status: 'checking',
        database: {
            connected: false,
            error: null
        },
        firebase: {
            status: getFirebaseStatus(),
            projectId: process.env.FB_PROJECT_ID || 'Not Specified'
        },
        environment: {
            nodeEnv: process.env.NODE_ENV || 'development',
            port: process.env.PORT || 5000,
            hasServiceAccountJson: !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
            hasServiceAccountPath: !!process.env.FIREBASE_SERVICE_ACCOUNT_PATH
        }
    };

    try {
        // Check DB connection
        await pool.query('SELECT 1');
        healthInfo.database.connected = true;
        healthInfo.status = 'ok';
    } catch (error) {
        healthInfo.database.error = error.message;
        healthInfo.status = 'error';
    }

    // Determine final status
    if (healthInfo.firebase.status.startsWith('ERROR') || healthInfo.firebase.status === 'MISSING_CREDENTIALS') {
        healthInfo.status = 'configuration_error';
    }

    res.json(healthInfo);
});

export default router;
