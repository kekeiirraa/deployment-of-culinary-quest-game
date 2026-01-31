// auth controller: register and login for ca2
// uses bcrypt for password hashing and jwt for session tokens

const usersModels = require('../models/usersModels');

// validates register body (username and password required) and checks username not taken
module.exports.validateRegister = (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  usersModels.checkUsernameExists(username, (err, results) => {
    if (err) {
      console.error('Error checking username:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    next();
  });
};

// creates user after password has been hashed by middleware (res.locals.hash)
module.exports.register = (req, res, next) => {
  const username = req.body.username;
  const password_hash = res.locals.hash;
  usersModels.createUser({ username, password_hash }, (err, results, fields) => {
    if (err) {
      console.error('Error creating user:', err);
      return res.status(500).json({ error: 'Failed to create user' });
    }
    const user_id = results.insertId;
    usersModels.updateUserRank({ user_id, rank_id: 1 }, (rankErr) => {
      if (rankErr) console.error('Error setting rank:', rankErr);
      res.status(201).json({
        message: 'Registration successful',
        user_id,
        username,
        points: 0,
        rank: 'Kitchen Novice'
      });
    });
  });
};

// loads user by username for login and sets res.locals.hash and res.locals.userId
// required before comparePassword and generateToken
module.exports.loadUserForLogin = (req, res, next) => {
  const username = req.body.username;
  if (!username || !req.body.password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  usersModels.selectUserByUsernameForAuth(username, (err, results) => {
    if (err) {
      console.error('Error loading user:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const user = results[0];
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    res.locals.hash = user.password_hash;
    res.locals.userId = user.user_id;
    next();
  });
};
