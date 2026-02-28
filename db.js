require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    // Aiven үшін міндетті баптау:
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect((err) => {
    if (err) {
        console.error('MySQL-ге қосылу қатесі:', err.message);
        return;
    }
    console.log(`Aiven MySQL базасына ${process.env.DB_PORT} порты арқылы сәтті қосылды!`);
});

module.exports = db;