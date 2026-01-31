// express application setup and configuration
// defines routes, middleware, and error handling for the wellness game api

const express = require('express');
const path = require('path');

const authRoutes = require('./src/routes/authRoutes');
const usersRoutes = require('./src/routes/usersRoutes');
const challengesRoutes = require('./src/routes/challengesRoutes');
const completionsRoutes = require('./src/routes/completionsRoutes');
const gamesRoutes = require('./src/routes/gamesRoutes');

const app = express();

// parses json request bodies
app.use(express.json());
// parses url-encoded request bodies
app.use(express.urlencoded({ extended: false }));

// serve static frontend files from public folder (ca2)
app.use(express.static(path.join(__dirname, 'public')));

// logs method, url, and timestamp for debugging purposes
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toLocaleTimeString()}`);
    next();
});

// api routes
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/challenges', challengesRoutes);
app.use('/completions', completionsRoutes);
app.use('/games', gamesRoutes);

// api info endpoint (for non-html requests to root)
app.get('/api', (req, res) => {
    res.json({
        message: 'Culinary Adventure Wellness Game API',
        version: '1.0.0',
        endpoints: {
            auth: '/auth',
            users: '/users',
            challenges: '/challenges',
            completions: '/completions',
            games: '/games'
        }
    });
});

// error handling middleware 
// catches any errors that occur during request processing
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Something went wrong' });
});

// catch-all route handler for undefined routes
// returns 404 for any routes that don't match defined endpoints
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// export app for use in index.js
module.exports = app;
