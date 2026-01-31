const completionsModels = require('../models/completionsModels');

// handles POST request to mark a challenge as completed by a user
// validates challenge and user exist, records completion, and awards points to user
module.exports.completeChallenge = (req, res, next) => {
    // extract challenge id from url parameters
    const challengeId = req.params.challenge_id;
    // extract user id and completion details from request body
    const { user_id, details } = req.body;

    // validate that user_id is provided
    if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
    }

    // first, get the challenge to retrieve its point value
    completionsModels.getChallengePoints(challengeId, (err, challengeResults) => {
        if (err) {
            console.error("Error getChallengePoints:", err);
            return res.status(500).json({ error: 'Database error' });
        }

        // verify challenge exists
        if (challengeResults.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // extract points value from challenge
        const challengePoints = challengeResults[0].points;

        // verify that the user exists before recording completion
        completionsModels.checkUserExists(user_id, (err, userResults) => {
            if (err) {
                console.error("Error checkUserExists:", err);
                return res.status(500).json({ error: 'Database error' });
            }

            // verify user exists
            if (userResults.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            // prepare completion data for database insertion
            const completionData = {
                challenge_id: challengeId,
                user_id: user_id,
                details: details || ''
            };

            // create completion record in database
            completionsModels.createCompletion(completionData, (err, completionResult) => {
                if (err) {
                    console.error("Error createCompletion:", err);
                    return res.status(500).json({ error: 'Failed to record completion' });
                }

                // prepare data to update user's total points
                const pointsData = {
                    points: challengePoints,
                    user_id: user_id
                };

                // add challenge points to user's total points
                completionsModels.updateUserPoints(pointsData, (err, updateResult) => {
                    if (err) {
                        console.error("Error updateUserPoints:", err);
                        return res.status(500).json({ error: 'Failed to update points' });
                    }

                    // return completion record with generated id
                    res.status(201).json({
                        complete_id: completionResult.insertId,
                        challenge_id: parseInt(challengeId),
                        user_id: parseInt(user_id),
                        details: details || ''
                    });
                });
            });
        });
    });
};

// handles GET request to retrieve all completions for a specific challenge
// returns list of all users who completed the challenge and their completion details
module.exports.getCompletionsByChallenge = (req, res, next) => {
    // extract challenge id from url parameters
    const challengeId = req.params.challenge_id;
    
    // callback function to handle database query results
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error getCompletionsByChallenge:", error);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // if no completions found, return 404
        if (results.length === 0) {
            return res.status(404).json({ error: 'No completions found for this challenge' });
        }
        
        // return all completions as json array
        res.status(200).json(results);
    };
    
    // call model function to query completions from database
    completionsModels.getCompletionsByChallenge(challengeId, callback);
};
