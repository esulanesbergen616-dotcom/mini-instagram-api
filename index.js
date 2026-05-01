require('dotenv').config();
const express = require('express');
const authRoutes = require('./auth');
const postRoutes = require('./posts'); 
const likeRoutes = require('./likes');
const commentRoutes = require('./comments');
const followRoutes = require('./follows');
const adsRouter = require('./ads'); 

const app = express();

// 1. МИНДЕТТІ: Ең алдымен JSON өңдеушіні қосамыз
app.use(express.json());

// 2. Роутерлер (Барлығы JSON-нан кейін болуы керек)
app.use('/auth', authRoutes);
app.use('/posts', postRoutes); 
app.use('/likes', likeRoutes);
app.use('/comments', commentRoutes);
app.use('/follows', followRoutes);
app.use('/api/ads', adsRouter); // Жарнама роутері осында

app.get('/', (req, res) => {
  res.send('Mini-Instagram API жұмыс істеп тұр!');
});

// 3. Қате өңдеуші (Ең соңында тұрады)
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
