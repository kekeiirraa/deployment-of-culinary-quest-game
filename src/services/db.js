// database connection pool configuration
// creates a connection pool to manage multiple database connections efficiently

const mysql = require('mysql2');

// create mysql connection pool with configuration
// connection pool allows reuse of connections and better performance
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'QWEasd123',
    database: 'food',
    connectionLimit: 10,        
    waitForConnections: true,    
    queueLimit: 0                // unlimited queue for connection requests
});

// test database connection on startup
// verifies that database connection is working properly
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed: ', err);
        return;
    }
    console.log('Connected to food database');
    // release connection back to pool after testing
    connection.release();
});

module.exports = pool;
