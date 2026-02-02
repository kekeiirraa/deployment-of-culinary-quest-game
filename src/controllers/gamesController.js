const gamesModels = require('../models/gamesModels');

// handles GET request to retrieve a user's game profile
// returns user information including rank, points, completions, and next rank goal
module.exports.getUserProfile = (req, res, next) => {
    const userId = req.params.userId;
    gamesModels.getUserProfile(userId, (error, results) => {
        if (error) {
            console.error('Error getUserProfile:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = results[0];
        const rank = calculateRank(user.points);
        res.status(200).json({
            user_id: user.user_id,
            username: user.username,
            rank: rank,
            points: user.points,
            challenges_completed: user.completions,
            next_rank: getNextRank(user.points)
        });
    });
};

// handles GET request to retrieve the leaderboard
// returns top 10 users ranked by total points
module.exports.getLeaderboard = (req, res, next) => {
    gamesModels.getLeaderboard((error, results) => {
        if (error) {
            console.error('Error getLeaderboard:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({
            leaderboard: results,
            updated: new Date().toLocaleString()
        });
    });
};

// retrieves all challenges completed by a specific user
module.exports.getUserCompletedChallenges = (req, res, next) => {
    const userId = req.params.userId;
    gamesModels.getUserCompletedChallenges(userId, (error, results) => {
        if (error) {
            console.error('Error getUserCompletedChallenges:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
};

// retrieves all badges earned by a user
module.exports.getUserBadges = (req, res, next) => {
    const userId = req.params.userId;
    gamesModels.getUserBadges(userId, (error, results) => {
        if (error) {
            console.error('Error getUserBadges:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
};

// retrieves all available badges
module.exports.getAllBadges = (req, res, next) => {
    gamesModels.getAllBadges((error, results) => {
        if (error) {
            console.error('Error getAllBadges:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
};

// awards badge to user and checks if they qualify
module.exports.checkAndAwardBadges = (userId, callback) => {
    // get user's completion count
    gamesModels.getUserProfile(userId, (error, results) => {
        if (error || results.length === 0) {
            return callback(error);
        }
        const completions = results[0].completions;

        // award "First Challenge" badge if this is their first completion
        if (completions === 1) {
            gamesModels.awardBadge({ user_id: userId, badge_id: 1 }, callback);
        } else {
            callback(null);
        }
    });
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
