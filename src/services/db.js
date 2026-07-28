// database service: postgres connection pool (neon)
// the rest of the app was written against mysql2's callback api, so this module
// keeps that exact shape - pool.query(sql, values, callback) - and translates
// mysql flavoured sql to postgres underneath. that way models and controllers
// stay unchanged and readable.

const path = require('path');

// Load .env from project root (same folder as package.json), regardless of cwd
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { Pool, types } = require('pg');

// mysql2 was configured with dateStrings: true, so the frontend receives
// timestamps as plain strings. keep that behaviour instead of Date objects.
types.setTypeParser(1082, (value) => value); // DATE
types.setTypeParser(1114, (value) => value); // TIMESTAMP
types.setTypeParser(1184, (value) => value); // TIMESTAMPTZ
// COUNT() comes back as bigint, which pg returns as a string; the dashboard
// does maths on it, so parse it into a real number like mysql2 did.
types.setTypeParser(20, (value) => parseInt(value, 10));

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string.');
}

const pool = new Pool({
    connectionString,
    max: 10, // same connection limit the app used before
    // neon only accepts tls, and its certificate is signed by a public CA, so
    // verify it properly rather than trusting any certificate presented
    ssl: { rejectUnauthorized: true },
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000
});

// surface pool level problems instead of letting them crash the process
pool.on('error', (err) => {
    console.error('Unexpected database pool error:', err.message);
});

// converts mysql "?" placeholders into postgres "$1, $2, ..." placeholders.
// walks the string so that question marks inside quoted text are left alone.
function convertPlaceholders(sql) {
    let output = '';
    let placeholderCount = 0;
    let insideQuotes = false;

    for (let i = 0; i < sql.length; i++) {
        const character = sql[i];

        if (character === "'") {
            // '' inside a string literal is an escaped quote, not the end of it
            if (insideQuotes && sql[i + 1] === "'") {
                output += "''";
                i++;
                continue;
            }
            insideQuotes = !insideQuotes;
            output += character;
            continue;
        }

        if (character === '?' && !insideQuotes) {
            placeholderCount++;
            output += '$' + placeholderCount;
            continue;
        }

        output += character;
    }

    return output;
}

// translates the mysql specific syntax the models use into postgres equivalents
function translateToPostgres(sql) {
    let statement = convertPlaceholders(sql).trim();

    // drop the trailing semicolon so we can safely append clauses below
    while (statement.endsWith(';')) {
        statement = statement.slice(0, -1).trim();
    }

    const isInsert = /^insert\s/i.test(statement);

    // mysql: INSERT IGNORE ...  ->  postgres: INSERT ... ON CONFLICT DO NOTHING
    if (/^insert\s+ignore\s+into\s/i.test(statement)) {
        statement = statement.replace(/^insert\s+ignore\s+into\s/i, 'INSERT INTO ');
        if (!/on\s+conflict/i.test(statement)) {
            statement += ' ON CONFLICT DO NOTHING';
        }
    }

    // mysql exposes result.insertId after an insert; postgres needs RETURNING
    if (isInsert && !/\breturning\b/i.test(statement)) {
        statement += ' RETURNING *';
    }

    return statement;
}

// mysql2 hands controllers an array of rows that also carries insertId and
// affectedRows. rebuild that same object so no controller needs rewriting.
function buildResult(pgResult) {
    const rows = pgResult.rows || [];

    rows.affectedRows = pgResult.rowCount;

    // every table declares its primary key first, so the first "*_id" column of
    // the returned row is the newly generated id
    if (rows.length > 0) {
        const idColumn = Object.keys(rows[0]).find((column) => column.endsWith('_id'));
        if (idColumn) {
            rows.insertId = rows[0][idColumn];
        }
    }

    return rows;
}

// drop-in replacement for mysql2's pool.query
// supports query(sql, callback) and query(sql, values, callback)
function query(sql, values, callback) {
    if (typeof values === 'function') {
        callback = values;
        values = [];
    }

    const statement = translateToPostgres(sql);

    return pool
        .query(statement, values || [])
        .then((result) => {
            if (callback) callback(null, buildResult(result), result.fields);
        })
        .catch((error) => {
            if (callback) return callback(error);
            throw error;
        });
}

// promise based helper for migration scripts and tests
function queryAsync(sql, values) {
    return pool.query(translateToPostgres(sql), values || []).then(buildResult);
}

// runs sql exactly as written, with no translation - used by the migration
// script, which already contains multi statement postgres ddl
function raw(sql) {
    return pool.query(sql);
}

module.exports = {
    query,
    queryAsync,
    raw,
    end: () => pool.end(),
    pool
};
