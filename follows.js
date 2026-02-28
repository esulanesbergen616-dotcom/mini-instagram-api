const express = require('express');
const router = express.Router();
const db = require('./db');
const authenticateToken = require('./authMiddleware');

// 1. Пайдаланушыға жазылу немесе жазылудан бас тарту (Toggle Follow)
router.post('/:userId', authenticateToken, (req, res) => {
  const follower_id = req.user.id;      // Мен (кім жазылып жатыр)
  const followee_id = req.params.userId; // Ол (кімге жазылып жатырмын)

  if (follower_id == followee_id) {
    return res.status(400).json({ message: 'Өзіңізге жазыла алмайсыз' });
  }

  const checkQuery = 'SELECT * FROM follows WHERE follower_id = ? AND followee_id = ?';
  
  db.query(checkQuery, [follower_id, followee_id], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length > 0) {
      // Unfollow
      const deleteQuery = 'DELETE FROM follows WHERE follower_id = ? AND followee_id = ?';
      db.query(deleteQuery, [follower_id, followee_id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Жазылу тоқтатылды' });
      });
    } else {
      // Follow
      const insertQuery = 'INSERT INTO follows (follower_id, followee_id) VALUES (?, ?)';
      db.query(insertQuery, [follower_id, followee_id], (err) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ message: 'Сәтті жазылдыңыз!' });
      });
    }
  });
});

module.exports = router;