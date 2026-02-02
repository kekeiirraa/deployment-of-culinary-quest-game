// one-time migration for ca2: add password_hash and email to user table
// run with: node src/configs/addPasswordColumn.js
// only needed if you already have the database from ca1

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'QWEasd123',
  database: 'food',
  multipleStatements: true
});

// add password_hash column if not exists
connection.query('ALTER TABLE User ADD COLUMN password_hash VARCHAR(255) NULL;', (err1) => {
  if (err1 && err1.code !== 'ER_DUP_FIELDNAME') {
    console.error('Error adding password_hash:', err1.message);
  } else {
    console.log('password_hash column ready.');
  }

  // add email column if not exists
  connection.query('ALTER TABLE User ADD COLUMN email VARCHAR(255) NULL UNIQUE;', (err2) => {
    if (err2 && err2.code !== 'ER_DUP_FIELDNAME') {
      console.error('Error adding email:', err2.message);
    } else {
      console.log('email column ready.');
    }
    connection.end();
    process.exit(0);
  });
});
