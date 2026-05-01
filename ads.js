const express = require('express');
const router = express.Router();
const pool = require('./db'); // db.js файлына сілтеме

// Барлық жарнамаларды алу
router.get('/', async (req, res) => {
    try {
        const allAds = await pool.query("SELECT * FROM ads ORDER BY created_at DESC");
        res.json(allAds.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Сервер қатесі");
    }
});

// Жарнама қосу (бұл Android-қа емес, админге керек)
router.post('/', async (req, res) => {
    try {
        const { title, image_url, link_url } = req.body;
        const newAd = await pool.query(
            "INSERT INTO ads (title, image_url, link_url) VALUES($1, $2, $3) RETURNING *",
            [title, image_url, link_url]
        );
        res.json(newAd.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

module.exports = router;
