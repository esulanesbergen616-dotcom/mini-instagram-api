const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your_access_secret_key';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Токен табылмады' });

  // Енді біз ACCESS_SECRET айнымалысын қолданамыз
  jwt.verify(token, ACCESS_SECRET, (err, user) => {
    if (err) {
      console.error("JWT тексеру қатесі:", err.message);
      return res.status(403).json({ message: 'Токен жарамсыз' });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
