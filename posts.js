const express = require('express');
const router = express.Router();
const db = require('./db');
const authenticateToken = require('./authMiddleware');

// --- ДЕРЕКТЕР БАЗАСЫ ҚҰРЫЛЫМЫН АВТОМАТТЫ ҚҰРУ ---
const createTablesQuery = `
    -- Пайдаланушылар кестесі (егер жоқ болса)
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Посттар кестесі
    CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        caption TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Медиа (суреттер) кестесі
    CREATE TABLE IF NOT EXISTS media (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        url TEXT NOT NULL
    );

    -- Рефреш токендер кестесі (СІЗДЕГІ ҚАТЕ ОСЫ ЖЕРДЕ БОЛДЫ)
    CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days')
    );
`;

// Кестелерді іске қосу
db.query(createTablesQuery, (err) => {
    if (err) {
        console.error('Кесте құруда қате шықты:', err.message);
    } else {
        console.log('Барлық қажетті кестелер (posts, media, refresh_tokens) дайын.');
    }
});
// ---------------------------------------------------

// 1. БАРЛЫҚ ПОСТТАРДЫ АЛУ (ЛЕНТА ҮШІН)
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
        res.json({
            page,
            limit,
            data: rows
        });
    });
});

// 2. ЖАҢА ПОСТ ЖАСАУ (АВТОРИЗАЦИЯ КЕРЕК)
router.post('/', authenticateToken, (req, res, next) => {
    const { caption, media_url } = req.body;
    const author_id = req.user.id; // Токеннен алынған пайдаланушы ID-і

    if (!media_url) {
        return res.status(400).json({ error: "Сурет сілтемесі (media_url) міндетті!" });
    }

    const postQuery = 'INSERT INTO posts (author_id, caption) VALUES ($1, $2) RETURNING id';
    
    db.query(postQuery, [author_id, caption], (err, result) => {
        if (err) return next(err);
        
        const postId = result.rows[0].id;

        const mediaQuery = 'INSERT INTO media (post_id, url) VALUES ($1, $2)';
        db.query(mediaQuery, [postId, media_url], (mErr) => {
            if (mErr) return next(mErr);
            res.status(201).json({ 
                message: 'Пост пен сурет сәтті жүктелді!', 
                postId,
                caption,
                media_url 
            });
        });
    });
});

module.exports = router;
