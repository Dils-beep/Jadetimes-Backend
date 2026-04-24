import pool from './config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initDb = async () => {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split schema by semicolon to run each statement separately
        const statements = schema
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log('Starting database initialization...');

        for (const statement of statements) {
            await pool.query(statement);
        }

        console.log('Database initialized successfully with all tables.');
    } catch (error) {
        console.error('Failed to initialize database:', error.message);
    } finally {
        process.exit();
    }
};

initDb();
