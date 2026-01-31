// route definitions for challenge-related endpoints
// handles all http requests related to challenges and their completions

const express = require('express');
const router = express.Router();

// import controller functions to handle request logic
const challengesController = require('../controllers/challengesController');
const completionsController = require('../controllers/completionsController');

// completion routes must be defined before /:id routes
// this prevents express from matching /:id pattern before completion routes
router.post('/:challenge_id/completions', completionsController.completeChallenge);
router.get('/:challenge_id/completions', completionsController.getCompletionsByChallenge);

// challenge crud routes
// create, read, update, and delete operations for challenges
router.post('/', challengesController.createChallenge);
router.get('/', challengesController.getAllChallenges);
router.put('/:id', challengesController.updateChallenge);
router.delete('/:id', challengesController.deleteChallenge);

module.exports = router;
