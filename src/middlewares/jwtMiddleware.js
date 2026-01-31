// jwt middleware for ca2: generate, send, and verify tokens
// used for session management after login

require('dotenv').config();
const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET_KEY;
const tokenDuration = process.env.JWT_EXPIRES_IN;
const tokenAlgorithm = process.env.JWT_ALGORITHM;

// generates jwt from res.locals.userId (set by loadUserForLogin) and stores in res.locals.token
module.exports.generateToken = (req, res, next) => {
  const payload = {
    userId: res.locals.userId,
    timestamp: new Date()
  };
  const options = {
    algorithm: tokenAlgorithm,
    expiresIn: tokenDuration
  };
  const callback = (err, token) => {
    if (err) {
      console.error('Error jwt:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    res.locals.token = token;
    next();
  };
  jwt.sign(payload, secretKey, options, callback);
};

// sends res.locals.token as json response
module.exports.sendToken = (req, res, next) => {
  const response = { token: res.locals.token };
  if (res.locals.message) {
    response.message = res.locals.message;
  }
  res.status(200).json(response);
};

// verifies bearer token from authorization header and sets res.locals.userId
// use on protected routes that require login
module.exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.substring(7);
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const callback = (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.locals.userId = decoded.userId;
    res.locals.tokenTimestamp = decoded.timestamp;
    next();
  };
  jwt.verify(token, secretKey, callback);
};
