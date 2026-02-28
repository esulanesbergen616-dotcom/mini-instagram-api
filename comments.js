const express = require('express');
const router = express.Router();
const db = require('./db');
const authenticateToken = require('./authMiddleware');

// 1. Постқа пікір қалдыру
router.post('/:postId', authenticateToken, (req, res) => {
  const { text } = req.body;
  const author_id = req.user.id;
  const post_id = req.params.postId;

  if (!text) return res.status(400).json({ message: 'Пікір мәтіні бос болмауы керек' });

  const query = 'INSERT INTO comments (post_id, author_id, text) VALUES (?, ?, ?)';
  db.query(query, [post_id, author_id, text], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ message: 'Пікір қосылды!', commentId: result.insertId });
  });
});

// 2. Белгілі бір посттың барлық пікірлерін алу
router.get('/:postId', (req, res) => {
  const query = `
    SELECT c.id, c.text, u.username, c.created_at 
    FROM comments c
    JOIN users u ON c.author_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at DESC`;

  db.query(query, [req.params.postId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

module.exports = router;