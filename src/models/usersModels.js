const pool = require('../services/db');

// creates a new user in the database with default values
// sets points to 0 and current_rank_id to 1 (Kitchen Novice)
// takes user data object with username, optional password_hash, and callback
module.exports.createUser = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO User (username, password_hash, points, current_rank_id)
    VALUES (?, ?, 0, 1);
    `;
    const VALUES = [data.username, data.password_hash || null];
    
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// retrieves user by username for login (returns password_hash for bcrypt compare)
// takes username and callback
module.exports.selectUserByUsernameForAuth = (username, callback) => {
    const SQLSTATEMENT = `
    SELECT user_id, username, password_hash
    FROM User
    WHERE username = ?;
    `;
    pool.query(SQLSTATEMENT, [username], callback);
};

// checks if a username already exists in the database
// used for validation before creating or updating users
// takes username and callback function
module.exports.checkUsernameExists = (username, callback) => {
    const SQLSTATEMENT = `
    SELECT user_id FROM User WHERE username = ?;
    `;
    const VALUES = [username];
    
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// retrieves all users from the database ordered by user id
// returns user_id, username, and points for each user
// takes callback function
module.exports.selectAllUsers = (callback) => {
    const SQLSTATEMENT = `
    SELECT user_id, username, points
    FROM User
    ORDER BY user_id;
    `;
    
    pool.query(SQLSTATEMENT, callback);
};

// retrieves a specific user by their id from the database
// takes user data object with user_id and callback function
module.exports.selectUserById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT user_id, username, points
    FROM User
    WHERE user_id = ?;
    `;
    const VALUES = [data.user_id];
    
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// updates a user's username and points in the database
// takes user data object with user_id, username, and points, plus callback function
module.exports.updateUser = (data, callback) => {
    const SQLSTATEMENT = `
    UPDATE User 
    SET username = ?, points = ?
    WHERE user_id = ?;
    `;
    const VALUES = [data.username, data.points, data.user_id];
    
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// updates a user's current chef rank in the database
// takes user data object with user_id and rank_id, plus callback function
module.exports.updateUserRank = (data, callback) => {
    const SQLSTATEMENT = `
    UPDATE User 
    SET current_rank_id = ?
    WHERE user_id = ?;
    `;
    const VALUES = [data.rank_id, data.user_id];
    
    pool.query(SQLSTATEMENT, VALUES, callback);
};
