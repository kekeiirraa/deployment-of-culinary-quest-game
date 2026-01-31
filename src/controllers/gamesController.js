const gamesModels = require('../models/gamesModels');

// handles GET request to retrieve a user's game profile
// returns user information including rank, points, completions, and next rank goal
module.exports.getUserProfile = (req, res, next) => {
    // extract user id from url parameters
    const userId = req.params.userId;

    // callback function to handle database query results
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error getUserProfile:", error);
            res.status(500).json(error);
        } else {
            // if user not found, return 404
            if (results.length === 0) {
                res.status(404).json({ error: 'User not found' });
            } else {
                // extract user data from first result
                const user = results[0];
                // calculate current rank based on user's total points
                const rank = calculateRank(user.points);
                
                // return user profile with calculated rank and next rank information
                res.status(200).json({
                    user_id: user.user_id,
                    username: user.username,
                    rank: rank,
                    points: user.points,
                    challenges_completed: user.completions,
                    next_rank: getNextRank(user.points)
                });
            }
        }
    };
    
    // call model function to query user profile from database
    gamesModels.getUserProfile(userId, callback);
};

// handles GET request to retrieve the leaderboard
// returns top 10 users ranked by total points
module.exports.getLeaderboard = (req, res, next) => {
    // callback function to handle database query results
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error getLeaderboard:", error);
            res.status(500).json(error);
        } else {
            // return leaderboard with timestamp
            res.status(200).json({
                leaderboard: results,
                updated: new Date().toLocaleString()
            });
        }
    };
    
    // call model function to query leaderboard from database
    gamesModels.getLeaderboard(callback);
};

// calculates the user's current chef rank based on their total points
// returns rank name as a string
function calculateRank(points) {
    if (points >= 1000) return 'Grand Gastromancer';
    if (points >= 600) return 'Master Chef';
    if (points >= 300) return 'Sous Chef';
    if (points >= 100) return 'Apprentice Chef';
    return 'Kitchen Novice';
}

// determines the next rank the user can achieve and points needed
// returns a string describing the next rank goal
function getNextRank(points) {
    if (points < 100) return 'Apprentice Chef at 100 points';
    if (points < 300) return 'Sous Chef at 300 points';
    if (points < 600) return 'Master Chef at 600 points';
    if (points < 1000) return 'Grand Gastromancer at 1000 points';
    return 'Max level reached!';
}

