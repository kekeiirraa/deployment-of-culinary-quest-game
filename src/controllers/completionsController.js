const completionsModels = require('../models/completionsModels');
const gamesController = require('./gamesController');

// handles POST request to mark a challenge as completed by a user
// validates challenge and user exist, records completion, and awards points to user
module.exports.completeChallenge = (req, res, next) => {
    const challengeId = req.params.challenge_id;
    const { user_id, details } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
    }

    // get challenge points
    completionsModels.getChallengePoints(challengeId, (err, challengeResults) => {
        if (err) {
            console.error('Error getChallengePoints:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (challengeResults.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        const challengePoints = challengeResults[0].points;

        // verify user exists
        completionsModels.checkUserExists(user_id, (err, userResults) => {
            if (err) {
                console.error('Error checkUserExists:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (userResults.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            // create completion record
            const completionData = {
                challenge_id: challengeId,
                user_id: user_id,
                details: details || ''
            };

            completionsModels.createCompletion(completionData, (err, completionResult) => {
                if (err) {
                    console.error('Error createCompletion:', err);
                    return res.status(500).json({ error: 'Failed to record completion' });
                }

                // update user points
                const pointsData = { points: challengePoints, user_id: user_id };
                completionsModels.updateUserPoints(pointsData, (err) => {
                    if (err) {
                        console.error('Error updateUserPoints:', err);
                        return res.status(500).json({ error: 'Failed to update points' });
                    }

                    // check and award badges (non-blocking)
                    gamesController.checkAndAwardBadges(user_id, (err) => {
                        if (err) console.error('Error awarding badges:', err);
                    });

                    // return success response
                    res.status(201).json({
                        complete_id: completionResult.insertId,
                        challenge_id: parseInt(challengeId),
                        user_id: parseInt(user_id),
                        details: details || '',
                        points_earned: challengePoints
                    });
                });
            });
        });
    });
};

// handles GET request to retrieve all completions for a specific challenge
// returns list of all users who completed the challenge and their completion details
module.exports.getCompletionsByChallenge = (req, res, next) => {
    const challengeId = req.params.challenge_id;
    completionsModels.getCompletionsByChallenge(challengeId, (error, results) => {
        if (error) {
            console.error('Error getCompletionsByChallenge:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'No completions found for this challenge' });
        }
        res.status(200).json(results);
    });
};
