const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
const router = express.Router();

// Құпия кілттерді .env файлынан алған дұрыс, егер жоқ болса осыларды қолданады
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your_access_secret_key';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_secret_key';

// ТІРКЕЛУ (REGISTER)
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Барлық өрісті толтырыңыз!' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // Кестедегі баған аты password_hash екеніне көз жеткізіңіз
        const query = 'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)';
        
        db.query(query, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Тіркелу кезіндегі SQL қатесі:', err.message);
                return res.status(500).json({ error: "Бұл почта немесе логин бос емес" });
            }
            console.log('Жаңа пайдаланушы тіркелді:', username);
            res.status(201).json({ message: 'Пайдаланушы тіркелді!' });
        });
    } catch (e) {
        console.error('Серверлік қате:', e);
        res.status(500).json({ message: 'Ішкі серверлік қате' });
    }
});

// ЛОГИН (LOGIN)
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = $1', [email], async (err, results) => {
        if (err) {
            console.error('Логин SQL қатесі:', err.message);
            return res.status(500).json({ error: err.message });
        }
        
        const rows = results.rows || results; 
        const user = rows[0];
        
        // Парольді тексеру (password_hash немесе password бағанына қарай)
        if (!user || !(await bcrypt.compare(password, user.password_hash || user.password))) {
            return res.status(401).json({ message: 'Қате деректер немесе пароль!' });
        }

        // Токендерді жасау
        const accessToken = jwt.sign({ id: user.id }, ACCESS_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '30d' });
        
        const jti = Math.random().toString(36).substring(7);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        // ҚАТЕ ТҮЗЕТІЛДІ: 'token' бағаны мен мәні ($2) қосылды
        const insertTokenQuery = 'INSERT INTO refresh_tokens (user_id, token, jti, expires_at) VALUES ($1, $2, $3, $4)';
        
        db.query(insertTokenQuery, [user.id, refreshToken, jti, expiresAt], (tokenErr) => {
            if (tokenErr) {
                console.error('Токен сақтау қатесі:', tokenErr.message);
                return res.status(500).json({ message: "Авторизация қатесі (Token Save Error)" });
            }
            
            // Жауап ретінде екі токенді де жіберу
            res.json({ 
                message: "Сәтті кірдіңіз!",
                accessToken, 
                refreshToken 
            });
        });
    });
});

module.exports = router;
