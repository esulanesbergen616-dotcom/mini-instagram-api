const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
const router = express.Router();

const ACCESS_SECRET = 'your_access_secret_key';
const REFRESH_SECRET = 'your_refresh_secret_key';

// 1. Тіркелу (Register)
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    // Мәліметтердің келгенін тексеру
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Барлық өрісті толтырыңыз!' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
        
        db.query(query, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Тіркелу қатесі:', err);
                return res.status(500).json({ error: err.message });
            }
            console.log('Жаңа пайдаланушы тіркелді:', username);
            res.status(201).json({ message: 'Пайдаланушы тіркелді!' });
        });
    } catch (e) {
        res.status(500).json({ message: 'Серверлік қате' });
    }
});

// 2. Логин
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json(err);
        
        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password_hash))) {
            return res.status(401).json({ message: 'Қате деректер!' });
        }

        const user = results[0];
        const accessToken = jwt.sign({ id: user.id }, ACCESS_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });
        
        // jti жасау
        const jti = Math.random().toString(36).substring(7);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Refresh токенді сақтау (қате болса да логин жұмыс істей беретіндей істейміз)
        db.query('INSERT INTO refresh_tokens (user_id, jti, expires_at) VALUES (?, ?, ?)', 
                 [user.id, jti, expiresAt], (tokenErr) => {
            if (tokenErr) console.error('Token сақтау қатесі:', tokenErr.message);
        });

        res.json({ accessToken, refreshToken });
    });
});

module.exports = router;
