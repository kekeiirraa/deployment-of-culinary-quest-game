const pool = require('../services/db');

// retrieves the point value of a specific challenge from the database
// takes challenge id and callback function
module.exports.getChallengePoints = (challengeId, callback) => {
    const SQLSTATEMENT = `
    SELECT points FROM WellnessChallenge WHERE challenge_id = ?;
    `;
    const VALUES = [challengeId];
    
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// checks if a user exists in the database by user id
// takes user id and callback function
module.exports.checkUserExists = (userId, callback) => {
    const SQLSTATEMENT = `
    SELECT user_id FROM User WHERE user_id = ?;
    `;
    const VALUES = [userId];
    
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// creates a new completion record when a user completes a challenge
// takes completion data object with challenge_id, user_id, and details, plus callback function
module.exports.createCompletion = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO UserCompletion (challenge_id, user_id, details)
    VALUES (?, ?, ?);
    `;
    const VALUES = [data.challenge_id, data.user_id, data.details || ''];
    
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// adds challenge points to a user's total points in the database
// uses sql addition to increment points atomically
// takes points data object with points to add and user_id, plus callback function
module.exports.updateUserPoints = (data, callback) => {
    const SQLSTATEMENT = `
    UPDATE User SET points = points + ? WHERE user_id = ?;
    `;
    const VALUES = [data.points, data.user_id];
    
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// retrieves all completions for a specific challenge from the database
// returns user_id and completion details ordered by completion time
// takes challenge id and callback function
module.exports.getCompletionsByChallenge = (challengeId, callback) => {
    const SQLSTATEMENT = `
    SELECT user_id, details
    FROM UserCompletion
    WHERE challenge_id = ?
    ORDER BY completed_at;
    `;
    const VALUES = [challengeId];
    
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// retrieves user information including their current chef rank
// uses left join to get rank name from chefranks table
// takes user id and callback function
module.exports.getUserInfo = (userId, callback) => {
    const SQLSTATEMENT = `
    SELECT u.user_id, u.username, u.points, cr.rank_name
    FROM User u
    LEFT JOIN ChefRanks cr ON u.current_rank_id = cr.rank_id
    WHERE u.user_id = ?;
    `;
    const VALUES = [userId];
    
    pool.query(SQLSTATEMENT, VALUES, callback);
};
