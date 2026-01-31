const usersModels = require('../models/usersModels');

// handles POST request to create a new user account
// validates username uniqueness and sets default rank to Kitchen Novice
module.exports.createUser = (req, res, next) => {
    // extract username from request body
    const data = { username: req.body.username };
    
    // validate that username is provided
    if (!data.username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    
    // check if username already exists in database
    usersModels.checkUsernameExists(data.username, (checkError, checkResults) => {
        if (checkError) {
            console.error("Error checking username:", checkError);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // if username exists, return conflict error
        if (checkResults.length > 0) {
            return res.status(409).json({ 
                error: 'Username already exists',
                message: 'Please choose a different username'
            });
        }
        
        // create new user in database
        usersModels.createUser(data, (createError, createResults, fields) => {
            if (createError) {
                console.error("Error creating user:", createError);
                return res.status(500).json({ error: 'Failed to create user' });
            }
            
            // set default rank to Kitchen Novice (rank_id 1) for new users
            const userData = { 
                user_id: createResults.insertId, 
                rank_id: 1 
            };
            
            // update user's rank in database
            usersModels.updateUserRank(userData, (rankError, rankResults) => {
                if (rankError) {
                    console.error("Error setting rank:", rankError);
                    // still return success even if rank update fails
                }
                
                // return created user with default values
                res.status(201).json({
                    user_id: createResults.insertId,
                    username: data.username,
                    points: 0,
                    rank: 'Kitchen Novice'
                });
            });
        });
    });
};


// handles GET request to retrieve all users from database
// returns list of all users with their user_id, username, and points
module.exports.getAllUsers = (req, res, next) => {
    // callback function to handle database query results
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error getAllUsers:", error);
            res.status(500).json(error);
        } else {
            // return all users as json array
            res.status(200).json(results);
        }
    };
    
    // call model function to query all users from database
    usersModels.selectAllUsers(callback);
};

// handles GET request to retrieve a specific user by id
// returns user information if found, 404 if user does not exist
module.exports.getUserById = (req, res, next) => {
    // extract user id from url parameters
    const data = { user_id: req.params.id };
    
    // callback function to handle database query results
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error getUserById:", error);
            res.status(500).json(error);
        } else {
            // if user not found, return 404
            if (results.length === 0) {
                res.status(404).json({ error: 'User not found' });
            } else {
                // return user data as json object
                res.status(200).json(results[0]);
            }
        }
    };
    
    // call model function to query user from database
    usersModels.selectUserById(data, callback);
};

// handles PUT request to update an existing user's information
// validates user exists and username uniqueness, then updates user data
module.exports.updateUser = (req, res, next) => {
    // extract user id from url parameters
    const user_id = req.params.id;
    // extract username and points from request body
    const { username, points } = req.body;
    
    // validate that all required fields are provided
    if (!username || points === undefined) {
        return res.status(400).json({ error: 'Username and points are required' });
    }
    
    // first verify that the user exists
    usersModels.selectUserById({ user_id }, (error, results) => {
        if (error) {
            console.error("Error selectUserById:", error);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // if user not found, return 404
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // check if the new username is already taken by another user
        usersModels.checkUsernameExists(username, (error, usernameResults) => {
            if (error) {
                console.error("Error checkUsernameExists:", error);
                return res.status(500).json({ error: 'Database error' });
            }
            
            // if username exists and belongs to a different user, return conflict
            if (usernameResults.length > 0 && usernameResults[0].user_id != user_id) {
                return res.status(409).json({ error: 'Username already exists' });
            }
            
            // prepare update data object
            const updateData = { user_id, username, points };
            
            // update user in database
            usersModels.updateUser(updateData, (error, results) => {
                if (error) {
                    console.error("Error updateUser:", error);
                    return res.status(500).json({ error: 'Failed to update user' });
                }
                
                // return updated user data
                res.status(200).json({
                    user_id: parseInt(user_id),
                    username: username,
                    points: parseInt(points)
                });
            });
        });
    });
};
