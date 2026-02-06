// auth routes for ca2: register and login
// register: validate -> hash password with bcrypt -> create user in db
// login: validate -> load user -> compare password with bcrypt -> generate jwt -> send token to frontend

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const bcryptMiddleware = require('../middlewares/bcryptMiddleware');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

// post /auth/register - create account (username, email, password); password is hashed before save
router.post('/register',
  authController.validateRegister,
  bcryptMiddleware.hashPassword,
  authController.register
);

// post /auth/login - send username/email and password; get back jwt if password matches
router.post('/login',
  authController.validateLogin,
  authController.loadUserForLogin,
  bcryptMiddleware.comparePassword,
  jwtMiddleware.generateToken,
  jwtMiddleware.sendToken
);

module.exports = router;
