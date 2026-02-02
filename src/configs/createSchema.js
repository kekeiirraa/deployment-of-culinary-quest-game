const mysql = require('mysql2');

// Create connection without specifying database (since it doesn't exist yet)
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'QWEasd123',
    multipleStatements: true
});

const SQLSTATEMENT = `
CREATE DATABASE IF NOT EXISTS food;
`;

connection.query(SQLSTATEMENT, (error, results) => {
    if (error) {
        console.error("Error creating database:", error);
        connection.end();
        process.exit(1);
    } else {
        console.log("Database 'food' created successfully!");
        connection.end();
        process.exit(0);
    }
});
