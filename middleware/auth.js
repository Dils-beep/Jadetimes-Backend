import admin from '../config/firebase.js';

export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    // DEBUG LOGS FOR LIVE TROUBLESHOOTING
    console.log('--- Auth Request Received ---');
    console.log('Header Present:', !!authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('Auth Failure: Invalid or missing Bearer token');
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log('>>> Auth Success! User UID:', decodedToken.uid);
        req.user = decodedToken;
        next();
    } catch (error) {
        // This is where we will catch the specific Firebase error
        console.error('!!! Auth Failure Detail:', error.code, '->', error.message);
        res.status(401).json({ error: 'Unauthorized: Invalid token', detail: error.message });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.email === 'admin@jadetimes.com' || req.user.admin === true)) {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
};
