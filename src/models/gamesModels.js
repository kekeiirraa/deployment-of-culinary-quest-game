const pool = require('../services/db');

// retrieves a user's profile information including completion count
// uses left join and count to get total number of challenges completed
// takes user id and callback function
module.exports.getUserProfile = (userId, callback) => {
    const SQLSTATEMENT = `
    SELECT u.user_id, u.username, u.points, 
           COUNT(uc.completion_id) as completions
    FROM Users u
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
    FROM Users 
    ORDER BY points DESC 
    LIMIT 10;
    `;

    pool.query(SQLSTATEMENT, callback);
};

// retrieves all challenges completed by a specific user
// includes challenge details and completion info
module.exports.getUserCompletedChallenges = (userId, callback) => {
    const SQLSTATEMENT = `
    SELECT wc.challenge_id, wc.description as challenge, wc.points,
           uc.completed_at, uc.details
    FROM UserCompletion uc
    JOIN WellnessChallenge wc ON uc.challenge_id = wc.challenge_id
    WHERE uc.user_id = ?
    ORDER BY uc.completed_at DESC;
    `;
    pool.query(SQLSTATEMENT, [userId], callback);
};

// retrieves all badges earned by a user
// includes badge name, description, and earned date
module.exports.getUserBadges = (userId, callback) => {
    const SQLSTATEMENT = `
    SELECT b.badge_id, b.badge_name, b.description, ub.earned_date
    FROM UserBadges ub
    JOIN Badges b ON ub.badge_id = b.badge_id
    WHERE ub.user_id = ?
    ORDER BY ub.earned_date DESC;
    `;
    pool.query(SQLSTATEMENT, [userId], callback);
};

// retrieves all available badges
module.exports.getAllBadges = (callback) => {
    const SQLSTATEMENT = `
    SELECT badge_id, badge_name, description
    FROM Badges
    ORDER BY badge_id;
    `;
    pool.query(SQLSTATEMENT, callback);
};

// awards a badge to a user
module.exports.awardBadge = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT IGNORE INTO UserBadges (user_id, badge_id)
    VALUES (?, ?);
    `;
    pool.query(SQLSTATEMENT, [data.user_id, data.badge_id], callback);
};

// ========================================
// recipe unlock system
// ========================================

// get all recipes with required_points (for cookbook and unlock check)
module.exports.getRecipes = (callback) => {
    const SQLSTATEMENT = `
    SELECT recipe_id, recipe_name, description, required_points
    FROM Recipes
    ORDER BY required_points ASC;
    `;
    pool.query(SQLSTATEMENT, callback);
};

// get recipe ids unlocked by a user
module.exports.getUserUnlockedRecipeIds = (userId, callback) => {
    const SQLSTATEMENT = `
    SELECT recipe_id FROM UserRecipes WHERE user_id = ?;
    `;
    pool.query(SQLSTATEMENT, [userId], callback);
};

// unlock a recipe for a user (when points qualify)
module.exports.unlockRecipeForUser = (userId, recipeId, callback) => {
    const SQLSTATEMENT = `
    INSERT IGNORE INTO UserRecipes (user_id, recipe_id) VALUES (?, ?);
    `;
    pool.query(SQLSTATEMENT, [userId, recipeId], callback);
};

// ========================================
// challenge categories
// ========================================

module.exports.getCategories = (callback) => {
    const SQLSTATEMENT = `
    SELECT category_id, name, icon, description FROM ChallengeCategory ORDER BY category_id;
    `;
    pool.query(SQLSTATEMENT, callback);
};
