// one-time migration for ca2: add password_hash to user table
// run with: node src/configs/addPasswordColumn.js
// only needed if you already have the database from ca1

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'QWEasd123',
  database: 'wellness_game'
});

connection.query('ALTER TABLE User ADD COLUMN password_hash VARCHAR(255) NULL;', (error) => {
  if (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('password_hash column already exists.');
    } else {
      console.error('Migration error:', error.message);
      connection.end();
      process.exit(1);
    }
  } else {
    console.log('password_hash column added.');
  }
  connection.end();
  process.exit(0);
});
