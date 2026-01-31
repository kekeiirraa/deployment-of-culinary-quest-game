// route definitions for game-related endpoints
// handles requests for user profiles and leaderboard

const express = require('express');
const router = express.Router();

// import controller functions to handle request logic
const gamesController = require('../controllers/gamesController');

// game feature routes
// get user profile with rank and statistics
router.get('/profile/:userId', gamesController.getUserProfile);
// get top players leaderboard
router.get('/leaderboard', gamesController.getLeaderboard);

module.exports = router;
