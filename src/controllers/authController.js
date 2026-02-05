// auth controller: register and login for ca2
// uses bcrypt for password hashing and jwt for session tokens
// includes server-side validation for email and password

const usersModels = require('../models/usersModels');

// validates email format: must contain @ and something after it
function isValidEmail(email) {
  const atIndex = email.indexOf('@');
  if (atIndex < 1) return false;
  if (atIndex >= email.length - 1) return false;
  return true;
}

// validates password strength (no regex, simple loops)
function isValidPassword(password) {
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
  let hasUpper = false;
  let hasLower = false;
  let hasNumber = false;
  let hasSpecial = false;
  const specialChars = '!@#$%^&*(),.?":{}|<>';
  for (let i = 0; i < password.length; i++) {
    const c = password[i];
    if (c >= 'A' && c <= 'Z') hasUpper = true;
    if (c >= 'a' && c <= 'z') hasLower = true;
    if (c >= '0' && c <= '9') hasNumber = true;
    if (specialChars.indexOf(c) !== -1) hasSpecial = true;
  }
  if (!hasUpper) return { valid: false, message: 'Password must contain at least one uppercase letter' };
  if (!hasLower) return { valid: false, message: 'Password must contain at least one lowercase letter' };
  if (!hasNumber) return { valid: false, message: 'Password must contain at least one number' };
  if (!hasSpecial) return { valid: false, message: 'Password must contain at least one special character' };
  return { valid: true };
}

// validates username: 3-20 chars, only letters, numbers, underscore
function isValidUsername(username) {
  if (username.length < 3 || username.length > 20) return false;
  for (let i = 0; i < username.length; i++) {
    const c = username[i];
    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c === '_') continue;
    return false;
  }
  return true;
}

// server-side validation for register
// checks username, email format, password strength, and uniqueness
module.exports.validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;

  // check required fields
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  // validate username format
  if (!isValidUsername(username)) {
    return res.status(400).json({ error: 'Username must be 3-20 characters, alphanumeric and underscores only' });
  }

  // validate email format
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // validate password strength
  const passwordCheck = isValidPassword(password);
  if (!passwordCheck.valid) {
    return res.status(400).json({ error: passwordCheck.message });
  }

  // check if username already exists
  usersModels.checkUsernameExists(username, (err, results) => {
    if (err) {
      console.error('Error checking username:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // check if email already exists
    usersModels.checkEmailExists(email, (err2, results2) => {
      if (err2) {
        console.error('Error checking email:', err2);
        return res.status(500).json({ error: 'Database error' });
      }
      if (results2.length > 0) {
        return res.status(409).json({ error: 'Email already exists' });
      }
      next();
    });
  });
};

// creates user after password has been hashed by middleware (res.locals.hash)
module.exports.register = (req, res, next) => {
  const { username, email } = req.body;
  const password_hash = res.locals.hash;
  usersModels.createUser({ username, email, password_hash }, (err, results) => {
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
        email,
        points: 0,
        rank: 'Kitchen Novice'
      });
    });
  });
};

// server-side validation for login
// checks that identifier (username or email) and password are provided
module.exports.validateLogin = (req, res, next) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username/email and password are required' });
  }
  next();
};

// loads user by username or email for login
// sets res.locals.hash and res.locals.userId for bcrypt compare and jwt
module.exports.loadUserForLogin = (req, res, next) => {
  const identifier = req.body.identifier;
  usersModels.selectUserByUsernameOrEmailForAuth(identifier, (err, results) => {
    if (err) {
      console.error('Error loading user:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username/email or password' });
    }
    const user = results[0];
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Invalid username/email or password' });
    }
    res.locals.hash = user.password_hash;
    res.locals.userId = user.user_id;
    res.locals.username = user.username;
    next();
  });
};
