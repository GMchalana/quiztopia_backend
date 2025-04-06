const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 6, 
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay : 0,
  });

  module.exports = db;