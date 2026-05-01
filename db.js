const { Pool } = require('pg');

const connectionString = 'postgresql://admin:HLC5X8pNwIeIQpkp1vXwFcSR2fQlFksG@dpg-d77r3aoule4c73dforag-a.frankfurt-postgres.render.com/instagram_db_04zl';

const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect((err) => {
    if (err) {
        return console.error('PostgreSQL-ге қосылу қатесі:', err.stack);
    }
    console.log('RENDER POSTGRESQL БАЗАСЫНА СӘТТІ ҚОСЫЛДЫ!');
    
    // БАРЛЫҚ КЕСТЕЛЕРДІ ҚҰРУ СОРАУЫ
    const createTables = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS ads (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255),
            image_url TEXT,
            link_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    pool.query(createTables, (err) => {
        if (err) {
            console.error('Кесте құру қатесі:', err.message);
        } else {
            console.log('Барлық кестелер (Users және Ads) дайын.');
        }
    });
});

module.exports = pool;
