import express from 'express';
import pool from '../config/db.js';
import { verifyToken, isSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// Sync user from Firebase (called on login)
router.post('/sync', verifyToken, async (req, res) => {
    try {
        const { uid, email, name } = req.user;

        // Check if user exists by email (to handle pre-assigned admins)
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (existing.length > 0) {
            // Update existing user's ID (if it was pending) and other info
            await pool.query(
                `UPDATE users SET id = ?, name = ? WHERE email = ?`,
                [uid, name || existing[0].name || '', email]
            );
        } else {
            // Standard insert
            await pool.query(
                `INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, 'user')`,
                [uid, email, name || '']
            );
        }

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

// Super Admin: Create/Assign Admin to Journal
router.post('/admin/assign', verifyToken, isSuperAdmin, async (req, res) => {
    try {
        const { email, journal_id, role = 'admin' } = req.body;

        if (!email || !journal_id) {
            return res.status(400).json({ error: 'Email and Journal ID are required' });
        }

        // Check if user exists by email
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (existing.length > 0) {
            // Update existing user
            await pool.query(
                'UPDATE users SET role = ?, journal_id = ? WHERE email = ?',
                [role, journal_id, email]
            );
        } else {
            // Create a placeholder user entry (ID will be updated on first sync/login)
            // We use a temporary ID prefix for pending admins
            const tempId = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await pool.query(
                'INSERT INTO users (id, email, role, journal_id) VALUES (?, ?, ?, ?)',
                [tempId, email, role, journal_id]
            );
        }

        res.json({ message: `Admin privileges assigned to ${email} for journal ${journal_id}` });
    } catch (error) {
        console.error('Error assigning admin:', error);
        res.status(500).json({ error: 'Failed to assign admin' });
    }
});

// Super Admin: Get all admins
router.get('/admins', verifyToken, isSuperAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, email, name, role, journal_id, created_at FROM users WHERE role IN ("admin", "super_admin")');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ error: 'Failed to fetch admins' });
    }
});

export default router;
