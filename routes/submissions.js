import express from 'express';
import multer from 'multer';
import {
    createSubmission,
    getAllSubmissions,
    getSubmissionById,
    updateSubmissionStatus,
    deleteSubmission
} from '../controllers/submissionsController.js';
import { verifyToken } from '../middleware/auth.js'; // Kept for auth integration

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Routes - Following requirements:
// POST /api/submissions
router.post('/', verifyToken, upload.array('files'), createSubmission);

// GET /api/submissions
router.get('/', verifyToken, getAllSubmissions);

// GET /api/submissions/:id
router.get('/:id', verifyToken, getSubmissionById);

// PUT /api/submissions/:id/status
router.put('/:id/status', verifyToken, updateSubmissionStatus);

// DELETE /api/submissions/:id
router.delete('/:id', verifyToken, deleteSubmission);

export default router;
