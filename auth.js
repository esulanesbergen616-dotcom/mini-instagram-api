const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
const router = express.Router();

const ACCESS_SECRET = 'your_access_secret_key';
const REFRESH_SECRET = 'your_refresh_secret_key';

// 1. Тіркелу (Create User) [cite: 21]
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
  db.query(query, [username, email, hashedPassword], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ message: 'Пайдаланушы тіркелді!' });
  });
});

// 2. Логин және Токен беру
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (results.length === 0 || !(await bcrypt.compare(password, results[0].password_hash))) {
      return res.status(401).json({ message: 'Қате деректер!' });
    }

    const user = results[0];
    const accessToken = jwt.sign({ id: user.id }, ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });
    const jti = jwt.decode(refreshToken).jti || Math.random().toString(36).substring(7);

    // Refresh токенді базаға сақтау [cite: 40]
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    db.query('INSERT INTO refresh_tokens (user_id, jti, expires_at) VALUES (?, ?, ?)', 
             [user.id, jti, expiresAt]);

    res.json({ accessToken, refreshToken });
  });
});

module.exports = router;