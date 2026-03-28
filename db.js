const mysql = require('mysql2');

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
        console.error('MySQL-ге қосылу қатесі:', err.message);
        return;
    }
    console.log('Aiven MySQL базасына ТІКЕЛЕЙ сәтті қосылды!');

    const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;

    db.query(createUsersTable, (err) => {
        if (err) console.error('Кесте қатесі:', err.message);
        else console.log('Users кестесі дайын.');
    });
});

module.exports = db;
