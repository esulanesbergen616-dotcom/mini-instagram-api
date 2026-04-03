const express = require('express');
const router = express.Router();
const db = require('./db');
const authenticateToken = require('./authMiddleware');


const createTablesQuery = `
    -- ЕСКІ КЕСТЕЛЕРДІ ӨШІРУ (БАРЛЫҚ ҚАТЕЛЕРДІ ТАЗАЛАУ ҮШІН)
    DROP TABLE IF EXISTS refresh_tokens CASCADE;
    DROP TABLE IF EXISTS media CASCADE;
    DROP TABLE IF EXISTS posts CASCADE;

    -- КЕСТЕЛЕРДІ ТАЗАДАН ҚҰРУ
    CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        caption TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE media (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        url TEXT NOT NULL
    );

    CREATE TABLE refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        jti TEXT, 
        expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days')
    );
`;
db.query(createTablesQuery, (err) => {
    if (err) {
        console.error('Кесте жаңартуда қате шықты:', err.message);
    } else {
        console.log('Деректер базасы құрылымы толық жаңартылды (jti қосылды).');
    }
});
// ---------------------------------------------------

// ПОСТТАРДЫ АЛУ (GET /posts)
router.get('/', (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
        SELECT p.id, p.caption, u.username, m.url AS image_url, p.created_at
        FROM posts p
        JOIN users u ON p.author_id = u.id
        LEFT JOIN media m ON p.id = m.post_id
        ORDER BY p.created_at DESC
        LIMIT $1 OFFSET $2`;

    db.query(query, [limit, offset], (err, results) => {
        if (err) return next(err);
        const rows = results.rows || [];
        res.json({ page, limit, data: rows });
    });
});

// ЖАҢА ПОСТ ЖАСАУ (POST /posts)
router.post('/', authenticateToken, (req, res, next) => {
    const { caption, media_url } = req.body;
    const author_id = req.user.id;

    if (!media_url) {
        return res.status(400).json({ error: "Сурет сілтемесі (media_url) керек!" });
    }

    const postQuery = 'INSERT INTO posts (author_id, caption) VALUES ($1, $2) RETURNING id';
    
    db.query(postQuery, [author_id, caption], (err, result) => {
        if (err) return next(err);
        
        const postId = result.rows[0].id;
        const mediaQuery = 'INSERT INTO media (post_id, url) VALUES ($1, $2)';
        
        db.query(mediaQuery, [postId, media_url], (mErr) => {
            if (mErr) return next(mErr);
            res.status(201).json({ message: 'Пост сәтті салынды!', postId });
        });
    });
});

module.exports = router;
