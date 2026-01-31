const pool = require('../services/db');

// retrieves a user's profile information including completion count
// uses left join and count to get total number of challenges completed
// takes user id and callback function
module.exports.getUserProfile = (userId, callback) => {
    const SQLSTATEMENT = `
    SELECT u.user_id, u.username, u.points, 
           COUNT(uc.completion_id) as completions
    FROM User u
    LEFT JOIN UserCompletion uc ON u.user_id = uc.user_id
    WHERE u.user_id = ?
    GROUP BY u.user_id;
    `;
    const VALUES = [userId];
    
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// retrieves the top 10 users ranked by total points for the leaderboard
// orders users by points in descending order and limits to 10 results
// takes callback function
module.exports.getLeaderboard = (callback) => {
    const SQLSTATEMENT = `
    SELECT user_id, username, points 
    FROM User 
    ORDER BY points DESC 
    LIMIT 10;
    `;
    
    pool.query(SQLSTATEMENT, callback);
};
