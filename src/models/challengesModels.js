const pool = require('../services/db');

// inserts a new cooking-themed wellness challenge into the database
// takes challenge data object and callback function
module.exports.createChallenge = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO WellnessChallenge (creator_id, description, points)
    VALUES (?, ?, ?);
    `;
    const VALUES = [data.user_id, data.description, data.points];
    
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// retrieves all challenges from the database ordered by challenge id
// takes callback function to handle query results
module.exports.selectAllChallenges = (callback) => {
    const SQLSTATEMENT = `
    SELECT challenge_id, description as challenge, creator_id, points
    FROM WellnessChallenge
    ORDER BY challenge_id;
    `;
    
    pool.query(SQLSTATEMENT, callback);
};

// retrieves a specific challenge by its id from the database
// takes challenge id and callback function
module.exports.selectChallengeById = (challengeId, callback) => {
    const SQLSTATEMENT = `
    SELECT challenge_id, description as challenge, creator_id, points
    FROM WellnessChallenge
    WHERE challenge_id = ?;
    `;
    const VALUES = [challengeId];
    
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// updates an existing challenge's description and points in the database
// takes challenge data object with id, description, and points, plus callback function
module.exports.updateChallenge = (data, callback) => {
    const SQLSTATEMENT = `
    UPDATE WellnessChallenge 
    SET description = ?, points = ?
    WHERE challenge_id = ?;
    `;
    const VALUES = [data.description, data.points, data.challenge_id];
    
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// deletes a challenge and all its related completions from the database
// first deletes completions, then deletes the challenge to maintain referential integrity
// takes challenge id and callback function
module.exports.deleteChallenge = (challengeId, callback) => {
    // delete all completions related to this challenge first
    const deleteCompletionsSQL = `
    DELETE FROM UserCompletion WHERE challenge_id = ?;
    `;
    
    pool.query(deleteCompletionsSQL, [challengeId], (err) => {
        if (err) {
            return callback(err);
        }
        
        // then delete the challenge itself
        const deleteChallengeSQL = `
        DELETE FROM WellnessChallenge WHERE challenge_id = ?;
        `;
        
        pool.query(deleteChallengeSQL, [challengeId], callback);
    });
};
