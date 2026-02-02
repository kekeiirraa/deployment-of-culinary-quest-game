// auth routes for ca2: register and login
// register uses bcrypt hash; login uses bcrypt compare and returns jwt

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const bcryptMiddleware = require('../middlewares/bcryptMiddleware');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

// post /auth/register - create account (username, password)
router.post('/register',
  authController.validateRegister,
  bcryptMiddleware.hashPassword,
  authController.register
);

// post /auth/login - authenticate with username or email and get jwt
router.post('/login',
  authController.validateLogin,
  authController.loadUserForLogin,
  bcryptMiddleware.comparePassword,
  jwtMiddleware.generateToken,
  jwtMiddleware.sendToken
);

module.exports = router;
