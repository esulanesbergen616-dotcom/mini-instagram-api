const express = require('express');
const router = express.Router();
const db = require('./db');
const authenticateToken = require('./authMiddleware');

// --- КЕСТЕЛЕРДІ АВТОМАТТЫ ҚҰРУ (БІР РЕТ ОРЫНДАЛАДЫ) ---
const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        caption TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS media (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        url TEXT NOT NULL
    );
`;

db.query(createTablesQuery, (err) => {
    if (err) console.error('Кесте құру қатесі:', err.message);
    else console.log('Posts және Media кестелері дайын.');
});
// ---------------------------------------------------

// Посттарды алу (Пагинациямен)
router.get('/', (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // PostgreSQL үшін $1, $2 қолданылады
    const query = `
        SELECT p.id, p.caption, u.username, m.url AS image_url 
        FROM posts p
        JOIN users u ON p.author_id = u.id
        LEFT JOIN media m ON p.id = m.post_id
        ORDER BY p.created_at DESC
        LIMIT $1 OFFSET $2`;

    db.query(query, [limit, offset], (err, results) => {
        if (err) return next(err);
        
        // PostgreSQL нәтижені results.rows ішінде қайтарады
        const rows = results.rows || results;
        res.json({
            page,
            limit,
            data: rows
        });
    });
});

// Пост жасау
router.post('/', authenticateToken, (req, res, next) => {
    const { caption, media_url } = req.body;
    const author_id = req.user.id;

    // PostgreSQL-де жаңа ID-ді алу үшін RETURNING id жазамыз
    const postQuery = 'INSERT INTO posts (author_id, caption) VALUES ($1, $2) RETURNING id';
    
    db.query(postQuery, [author_id, caption], (err, result) => {
        if (err) return next(err);
        
        const postId = result.rows[0].id; // RETURNING id арқылы келген мән

        if (media_url) {
            const mediaQuery = 'INSERT INTO media (post_id, url) VALUES ($1, $2)';
            db.query(mediaQuery, [postId, media_url], (mErr) => {
                if (mErr) return next(mErr);
                res.status(201).json({ message: 'Пост пен сурет жүктелді!', postId });
            });
        } else {
            res.status(201).json({ message: 'Пост салынды!', postId });
        }
    });
});

module.exports = router;
