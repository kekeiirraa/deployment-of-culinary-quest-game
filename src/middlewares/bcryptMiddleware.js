// bcrypt middleware for ca2: hash and compare passwords
// hash used when registering (store hash in db); compare used when logging in to check password

const bcrypt = require('bcrypt');

const saltRounds = 10;

// compares req.body.password with res.locals.hash (set by loadUserForLogin)
// calls next() if match, returns 401 if not
module.exports.comparePassword = (req, res, next) => {
  const callback = (err, isMatch) => {
    if (err) {
      console.error('Error bcrypt:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    if (isMatch) {
      next();
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  };
  bcrypt.compare(req.body.password, res.locals.hash, callback);
};

// hashes req.body.password and stores result in res.locals.hash
// used before creating user on register
module.exports.hashPassword = (req, res, next) => {
  const callback = (err, hash) => {
    if (err) {
      console.error('Error bcrypt:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    res.locals.hash = hash;
    next();
  };
  bcrypt.hash(req.body.password, saltRounds, callback);
};
