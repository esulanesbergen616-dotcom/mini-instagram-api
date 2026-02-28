require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect((err) => {
    if (err) {
        console.error('MySQL-ге қосылу қатесі:', err.message);
        return;
    }
    console.log(`MySQL-ге ${process.env.DB_PORT} порты арқылы қосылды!`);
});

module.exports = db;