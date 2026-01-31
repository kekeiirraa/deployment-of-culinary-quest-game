const challengesModels = require('../models/challengesModels');

// validates if a challenge description is cooking-themed by checking for cooking-related keywords
// returns true if the description contains at least one cooking keyword, false otherwise
function isCookingThemed(description) {
    // check if description is valid string
    if (!description || typeof description !== 'string') {
        return false;
    }

    // convert to lowercase for case-insensitive matching
    const lowerDescription = description.toLowerCase();

    // list of cooking-related keywords that should appear in challenges
    const cookingKeywords = [
        'chef', 'kitchen', 'cook', 'cooking', 'culinary',
        'recipe', 'ingredient', 'ingredients', 'market', 'grocery',
        'meal', 'meals', 'dish', 'dishes', 'prep', 'preparation',
        'baking', 'bake', 'stove', 'oven', 'pan', 'pot', 'knife',
        'spice', 'spices', 'flavor', 'taste', 'dining', 'restaurant',
        'gastronom', 'food', 'nutrition', 'healthy eating',
        'breakfast', 'lunch', 'dinner', 'snack'
    ];

    // check if at least one cooking keyword is present in the description
    return cookingKeywords.some(keyword => lowerDescription.includes(keyword));
}

// handles POST request to create a new cooking-themed wellness challenge
// validates input, ensures challenge is cooking-themed, then saves to database
module.exports.createChallenge = (req, res, next) => {
    // extract challenge data from request body
    const { description, user_id, points } = req.body;

    // validate that all required fields are provided
    if (!description || !user_id || !points) {
        return res.status(400).json({ error: 'Description, user_id, and points are required' });
    }

    // validate that challenge description is cooking-themed
    // this ensures all challenges fit the culinary adventure quest theme
    if (!isCookingThemed(description)) {
        return res.status(400).json({
            error: 'Challenge must be cooking-themed',
            message: 'Challenge descriptions must include cooking-related terms such as: chef, kitchen, cook, culinary, recipe, ingredients, market, meal, etc.'
        });
    }

    // prepare data object for database insertion
    const data = { description, user_id, points };

    // callback function to handle database response
    const callback = (err, result) => {
        if (err) {
            console.error("Error createChallenge:", err);
            return res.status(500).json({ error: 'Failed to create challenge' });
        }

        // return created challenge with generated id
        res.status(201).json({
            challenge_id: result.insertId,
            challenge: description,
            creator_id: parseInt(user_id),
            points: parseInt(points)
        });
    };

    // call model function to insert challenge into database
    challengesModels.createChallenge(data, callback);
};

// handles GET request to retrieve all challenges from database
// returns list of all cooking-themed wellness challenges
module.exports.getAllChallenges = (req, res, next) => {
    // callback function to handle database query results
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error getAllChallenges:", error);
            res.status(500).json(error);
        } else {
            // return all challenges as json array
            res.status(200).json(results);
        }
    };

    // call model function to query all challenges from database
    challengesModels.selectAllChallenges(callback);
};

// handles PUT request to update an existing challenge
// validates ownership, ensures cooking theme, then updates challenge in database
module.exports.updateChallenge = (req, res, next) => {
    // get challenge id from url parameters
    const challengeId = req.params.id;
    // extract update data from request body
    const { user_id, question, description, points } = req.body;

    // support both "question" and "description" field names for compatibility
    const challengeDescription = question || description;

    // validate that all required fields are provided
    if (!challengeDescription || !user_id || points === undefined) {
        return res.status(400).json({ error: 'Description (or question), user_id, and points are required' });
    }

    // validate that updated challenge description is still cooking-themed
    if (!isCookingThemed(challengeDescription)) {
        return res.status(400).json({
            error: 'Challenge must be cooking-themed',
            message: 'Challenge descriptions must include cooking-related terms such as: chef, kitchen, cook, culinary, recipe, ingredients, market, meal, etc.'
        });
    }

    // first check if challenge exists and get its creator information
    challengesModels.selectChallengeById(challengeId, (error, results) => {
        if (error) {
            console.error("Error selectChallengeById:", error);
            return res.status(500).json({ error: 'Database error' });
        }

        // if challenge not found, return 404
        if (results.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // get challenge data from first result
        const challenge = results[0];

        // verify that the user making the request is the challenge creator
        // convert both to numbers to ensure proper comparison
        const creatorId = parseInt(challenge.creator_id);
        const userId = parseInt(user_id);

        // only the creator can update their challenge
        if (creatorId !== userId) {
            return res.status(403).json({ error: 'Forbidden: Not the challenge owner' });
        }

        // prepare update data object
        const updateData = {
            challenge_id: challengeId,
            description: challengeDescription,
            points: points
        };

        // update challenge in database
        challengesModels.updateChallenge(updateData, (error, results) => {
            if (error) {
                console.error("Error updateChallenge:", error);
                return res.status(500).json({ error: 'Failed to update challenge' });
            }

            // return updated challenge data
            res.status(200).json({
                challenge_id: parseInt(challengeId),
                challenge: challengeDescription,
                creator_id: creatorId,
                points: parseInt(points)
            });
        });
    });
};

// handles DELETE request to remove a challenge from database
// also deletes all related completions when challenge is deleted
module.exports.deleteChallenge = (req, res, next) => {
    // get challenge id from url parameters
    const challengeId = req.params.id;

    // first verify that the challenge exists before attempting deletion
    challengesModels.selectChallengeById(challengeId, (error, results) => {
        if (error) {
            console.error("Error selectChallengeById:", error);
            return res.status(500).json({ error: 'Database error' });
        }

        // if challenge not found, return 404
        if (results.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // delete challenge and all related completions
        // the model handles cascading deletion of completions
        challengesModels.deleteChallenge(challengeId, (error, results) => {
            if (error) {
                console.error("Error deleteChallenge:", error);
                return res.status(500).json({ error: 'Failed to delete challenge' });
            }

            // return 204 no content on successful deletion
            res.status(204).send();
        });
    });
};
