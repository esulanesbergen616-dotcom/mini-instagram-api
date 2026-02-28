require('dotenv').config();
const express = require('express');
const authRoutes = require('./auth');
const postRoutes = require('./posts'); 
const likeRoutes = require('./likes');
const commentRoutes = require('./comments');
const followRoutes = require('./follows');

const app = express();
app.use(express.json());

// Роутерлер
app.use('/auth', authRoutes);
app.use('/posts', postRoutes); 
app.use('/likes', likeRoutes);
app.use('/comments', commentRoutes);
app.use('/follows', followRoutes);

app.get('/', (req, res) => {
  res.send('Mini-Instagram API жұмыс істеп тұр!');
});

// ГЛОБАЛДЫҚ ҚАТЕ ӨҢДЕУШІ (Error Handling)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Серверде ішкі қате болды',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер http://localhost:${PORT} портында қосылды`);
});