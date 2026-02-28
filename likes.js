const express = require('express');
const router = express.Router();
const db = require('./db');
const authenticateToken = require('./authMiddleware');

// 1. Лайк басу немесе Лайкты алып тастау (Toggle Like)
router.post('/:postId', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;

  // Алдымен бұл пайдаланушы бұрын лайк басты ма, соны тексереміз
  const checkQuery = 'SELECT * FROM likes WHERE user_id = ? AND post_id = ?';
  
  db.query(checkQuery, [userId, postId], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length > 0) {
      // Егер лайк бар болса - оны өшіреміз (Unlike)
      const deleteQuery = 'DELETE FROM likes WHERE user_id = ? AND post_id = ?';
      db.query(deleteQuery, [userId, postId], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Лайк алынып тасталды' });
      });
    } else {
      // Егер лайк жоқ болса - жаңадан қосамыз (Like)
      const insertQuery = 'INSERT INTO likes (user_id, post_id) VALUES (?, ?)';
      db.query(insertQuery, [userId, postId], (err) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ message: 'Лайк басылды!' });
      });
    }
  });
});

// 2. Посттың лайк санын көру
router.get('/:postId/count', (req, res) => {
  const query = 'SELECT COUNT(*) AS like_count FROM likes WHERE post_id = ?';
  db.query(query, [req.params.postId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results[0]);
  });
});

module.exports = router;