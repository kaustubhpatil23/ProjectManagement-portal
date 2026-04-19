const mysql = require('mysql2');
require('dotenv').config(); // This loads the variables from your .env file

const pool = mysql.createPool({
    // If process.env.DB_HOST exists (like on Railway), use it. 
    // Otherwise, default back to 'localhost' for your local machine.
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'project_portal',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection
pool.getConnection((err, conn) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Successfully connected to the MySQL database!');
        conn.release();
    }
});

module.exports = pool;
