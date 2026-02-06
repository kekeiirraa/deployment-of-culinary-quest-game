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

// parse json request bodies so we can read req.body in routes
app.use(express.json());
// parse url-encoded form data
app.use(express.urlencoded({ extended: false }));

// serve static frontend files from public folder (html, css, js, images)
app.use(express.static(path.join(__dirname, 'public')));

// log each request (method, url, time) for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toLocaleTimeString()}`);
  next();
});

// mount api routes under different paths
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/challenges', challengesRoutes);
app.use('/completions', completionsRoutes);
app.use('/games', gamesRoutes);

// api info endpoint: returns list of available endpoints (for postman or other clients)
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

// error handling middleware: catches errors thrown in routes and sends 500 response
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});

// catch-all: if no route matched, return 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// export app so index.js can start the server
module.exports = app;
