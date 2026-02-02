// route definitions for game-related endpoints
// handles requests for user profiles, leaderboard, badges, and progress

const express = require('express');
const router = express.Router();

// import controller functions to handle request logic
const gamesController = require('../controllers/gamesController');

// game feature routes
// get user profile with rank and statistics
router.get('/profile/:userId', gamesController.getUserProfile);
// get top players leaderboard
router.get('/leaderboard', gamesController.getLeaderboard);
// get user's completed challenges
router.get('/user/:userId/challenges', gamesController.getUserCompletedChallenges);
// get user's earned badges
router.get('/user/:userId/badges', gamesController.getUserBadges);
// get all available badges
router.get('/badges', gamesController.getAllBadges);

module.exports = router;
