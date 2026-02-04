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

// ========================================
// recipe unlock system
// ========================================

// get all recipes (for cookbook)
module.exports.getRecipes = (req, res, next) => {
    gamesModels.getRecipes((error, results) => {
        if (error) {
            console.error('Error getRecipes:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
};

// get recipes with unlock status for a user
module.exports.getUserRecipes = (req, res, next) => {
    const userId = req.params.userId;
    gamesModels.getRecipes((err, recipes) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        gamesModels.getUserUnlockedRecipeIds(userId, (err2, unlockedRows) => {
            if (err2) return res.status(500).json({ error: 'Database error' });
            const unlockedIds = (unlockedRows || []).map(r => r.recipe_id);
            const withStatus = (recipes || []).map(r => ({
                recipe_id: r.recipe_id,
                recipe_name: r.recipe_name,
                description: r.description,
                required_points: r.required_points,
                unlocked: unlockedIds.indexOf(r.recipe_id) !== -1
            }));
            res.status(200).json(withStatus);
        });
    });
};

// unlock recipe for user when points qualify (idempotent)
module.exports.unlockRecipe = (req, res, next) => {
    const userId = req.params.userId;
    const recipeId = parseInt(req.params.recipeId, 10);
    if (!recipeId) return res.status(400).json({ error: 'Invalid recipe id' });
    gamesModels.getRecipes((err, recipes) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        const recipe = (recipes || []).find(r => r.recipe_id === recipeId);
        if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
        gamesModels.getUserProfile(userId, (err2, profileRows) => {
            if (err2 || !profileRows || profileRows.length === 0) return res.status(404).json({ error: 'User not found' });
            const points = profileRows[0].points;
            if (points < recipe.required_points) {
                return res.status(400).json({ error: 'Not enough points to unlock this recipe' });
            }
            gamesModels.unlockRecipeForUser(userId, recipeId, (err3) => {
                if (err3) return res.status(500).json({ error: 'Database error' });
                res.status(200).json({ message: 'Recipe unlocked', recipe_id: recipeId });
            });
        });
    });
};

// get challenge categories
module.exports.getCategories = (req, res, next) => {
    gamesModels.getCategories((error, results) => {
        if (error) {
            console.error('Error getCategories:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results || []);
    });
};
