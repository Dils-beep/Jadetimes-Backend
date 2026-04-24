import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Sync user from Firebase (called on login)
router.post('/sync', verifyToken, async (req, res) => {
    try {
        const { uid, email, name, picture } = req.user;

        // Upsert user
        await pool.query(
            `INSERT INTO users (id, email, name) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE name = ?, email = ?`,
            [uid, email, name || '', name || '', email]
        );

        res.json({ message: 'User synced successfully' });
    } catch (error) {
        console.error('User sync error:', error);
        res.status(500).json({ error: 'Failed to sync user' });
    }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.uid]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

export default router;
