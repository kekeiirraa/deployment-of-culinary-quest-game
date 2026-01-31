// route definitions for user-related endpoints
// handles all http requests related to user management

const express = require('express');
const router = express.Router();

// import controller functions to handle request logic
const usersController = require('../controllers/usersController');

// user crud routes
// create, read, and update operations for users
router.post('/', usersController.createUser);
router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);
router.put('/:id', usersController.updateUser);

module.exports = router;
