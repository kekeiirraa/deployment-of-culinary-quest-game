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

// recipe unlock system
router.get('/recipes', gamesController.getRecipes);
router.get('/user/:userId/recipes', gamesController.getUserRecipes);
router.post('/user/:userId/recipes/:recipeId/unlock', gamesController.unlockRecipe);

// challenge categories
router.get('/categories', gamesController.getCategories);

module.exports = router;
