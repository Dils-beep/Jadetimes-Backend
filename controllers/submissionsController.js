import pool from '../config/db.js';

export const createSubmission = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const {
            id,
            title,
            section,
            abstract,
            keywords,
            competingInterests,
            subjects,
            commentsForEditor,
            checklistAgreed,
            privacyAgreed,
            contributors,
            funders
        } = req.body;

        // 1. Insert Submission
        await connection.query(
            `INSERT INTO submissions 
            (id, user_id, title, section, abstract, keywords, competing_interests, subjects, comments_for_editor, checklist_agreed, privacy_agreed) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, req.user?.uid || null, title, section, abstract, keywords, competingInterests, subjects, commentsForEditor, checklistAgreed === 'true' || checklistAgreed === true, privacyAgreed === 'true' || privacyAgreed === true]
        );

        // 2. Insert Contributors
        if (contributors) {
            const parsedContributors = typeof contributors === 'string' ? JSON.parse(contributors) : contributors;
            for (const c of parsedContributors) {
                await connection.query(
                    `INSERT INTO contributors (submission_id, name, email, role, affiliation, is_primary) 
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [id, c.name, c.email, c.role, c.affiliation, c.isPrimary || false]
                );
            }
        }

        // 3. Insert Funders
        if (funders) {
            const parsedFunders = typeof funders === 'string' ? JSON.parse(funders) : funders;
            for (const f of parsedFunders) {
                await connection.query(
                    `INSERT INTO funders (submission_id, name, funder_id, grant_number) 
                    VALUES (?, ?, ?, ?)`,
                    [id, f.name, f.id, f.grant]
                );
            }
        }

        // 4. Insert Files
        if (req.files) {
            for (const file of req.files) {
                await connection.query(
                    `INSERT INTO submission_files (submission_id, file_name, file_size, file_type, file_path) 
                    VALUES (?, ?, ?, ?, ?)`,
                    [id, file.originalname, file.size, file.mimetype, file.path]
                );
            }
        }

        await connection.commit();
        res.status(201).json({ message: 'Submission created successfully', id });
    } catch (error) {
        await connection.rollback();
        console.error(`Submission creation error for user ${req.user?.uid || 'anonymous'}:`, error);
        res.status(500).json({ error: 'Failed to create submission', details: error.message });
    } finally {
        connection.release();
    }
};

export const getAllSubmissions = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id as submission_id, title, section as section_name, status, created_at FROM submissions ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
};

export const getSubmissionById = async (req, res) => {
    try {
        const [submissions] = await pool.query('SELECT * FROM submissions WHERE id = ?', [req.params.id]);
        if (submissions.length === 0) return res.status(404).json({ error: 'Submission not found' });

        const submission = submissions[0];
        const [contributors] = await pool.query('SELECT * FROM contributors WHERE submission_id = ?', [req.params.id]);
        const [funders] = await pool.query('SELECT * FROM funders WHERE submission_id = ?', [req.params.id]);
        const [files] = await pool.query('SELECT * FROM submission_files WHERE submission_id = ?', [req.params.id]);

        res.json({
            submission,
            contributors,
            submission_files: files,
            funders
        });
    } catch (error) {
        console.error('Error fetching submission details:', error);
        res.status(500).json({ error: 'Failed to fetch submission details' });
    }
};

export const updateSubmissionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await pool.query('UPDATE submissions SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
};

export const deleteSubmission = async (req, res) => {
    try {
        await pool.query('DELETE FROM submissions WHERE id = ?', [req.params.id]);
        res.json({ message: 'Submission deleted successfully' });
    } catch (error) {
        console.error('Error deleting submission:', error);
        res.status(500).json({ error: 'Failed to delete submission' });
    }
};
