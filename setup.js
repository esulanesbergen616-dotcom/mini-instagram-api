const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'mysql-15344f45-mini-instagram.j.aivencloud.com',
  port: 13574,
  user: 'avnadmin',
  password: 'AVNS_gNybVLa9gu6m6y3CvMy', 
  database: 'defaultdb',
  ssl: { rejectUnauthorized: false }
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    profile_pic VARCHAR(255)
  );
`;

connection.query(createTableQuery, (err) => {
  if (err) throw err;
  console.log("Кесте сәтті құрылды!");
  connection.end();
});