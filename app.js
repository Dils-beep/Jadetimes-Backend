import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import configurations to initialize them on startup
import './config/db.js';
import './config/firebase.js';

// Import routes
import submissionRoutes from './routes/submissions.js';
import userRoutes from './routes/users.js';
import healthRoutes from './routes/health.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/submissions', submissionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/health', healthRoutes);

// Basic health check
app.get('/', (req, res) => {
    res.send('Jadetimes Journal API is running');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
