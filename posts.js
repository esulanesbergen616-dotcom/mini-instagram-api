const express = require('express');
const router = express.Router();
const db = require('./db');
const authenticateToken = require('./authMiddleware');

// Посттарды алу (Пагинациямен)
router.get('/', (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
        SELECT p.id, p.caption, u.username, m.url AS image_url 
        FROM posts p
        JOIN users u ON p.author_id = u.id
        LEFT JOIN media m ON p.id = m.post_id
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?`;

    db.query(query, [limit, offset], (err, results) => {
        if (err) return next(err); // Қатені index.js-ке жіберу
        res.json({
            page,
            limit,
            data: results
        });
    });
});

// Пост жасау
router.post('/', authenticateToken, (req, res, next) => {
    const { caption, media_url } = req.body;
    const author_id = req.user.id;

    const postQuery = 'INSERT INTO posts (author_id, caption) VALUES (?, ?)';
    db.query(postQuery, [author_id, caption], (err, result) => {
        if (err) return next(err);
        
        const postId = result.insertId;
        if (media_url) {
            const mediaQuery = 'INSERT INTO media (post_id, url) VALUES (?, ?)';
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