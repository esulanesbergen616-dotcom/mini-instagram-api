const mysql = require('mysql2');

// Деректерді тікелей жазамыз (Hardcode), Render баптауларына тәуелді болмау үшін
const db = mysql.createConnection({
    host: 'mysql-15344f45-mini-instagram.j.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_gNybVLa9gu6m6y3CvMy',
    database: 'defaultdb',
    port: 13574,
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect((err) => {
    if (err) {
        console.error('MySQL-ге қосылу қатесі (Тікелей):', err.message);
        return;
    }
    console.log('Aiven MySQL базасына ТІКЕЛЕЙ сәтті қосылды!');

    // Пайдаланушылар кестесі
    const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;

    // Токендер кестесі
    const createTokensTable = `
    CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        jti VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`;

    db.query(createUsersTable, (err) => {
        if (err) console.error('Users кесте қатесі:', err.message);
        else console.log('Users кестесі дайын.');
    });

    db.query(createTokensTable, (err) => {
        if (err) console.error('Tokens кесте қатесі:', err.message);
        else console.log('Refresh Tokens кестесі дайын.');
    });
});

module.exports = db;
