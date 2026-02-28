require('dotenv').config(); // .env файлынан деректерді оқу үшін
const mysql = require('mysql2');

// .env файлынан алынған мәліметтермен қосылу
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { 
    rejectUnauthorized: false // Aiven үшін міндетті түрде керек
  }
});

// Users кестесін құруға арналған SQL сұраныс
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    profile_pic VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

connection.connect((err) => {
  if (err) {
    console.error('Қосылу қатесі:', err.message);
    return;
  }
  console.log('Aiven базасына қосылды. Кесте құрылуда...');

  connection.query(createTableQuery, (err, results) => {
    if (err) {
      console.error('Кестені құруда қате шықты:', err.message);
    } else {
      console.log('Кесте сәтті құрылды немесе ол қазірдің өзінде бар!');
    }
    
    // Жұмыс біткен соң қосылымды жабамыз
    connection.end();
  });
});