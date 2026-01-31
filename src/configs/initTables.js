const mysql = require('mysql2');

// Create connection to create database if it doesn't exist, then use it
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'QWEasd123',
  multipleStatements: true
});

// First, ensure the database exists
connection.query('CREATE DATABASE IF NOT EXISTS wellness_game;', (error) => {
  if (error) {
    console.error("Error creating database:", error);
    connection.end();
    process.exit(1);
  }

  // Now use the database
  connection.query('USE wellness_game;', (error) => {
    if (error) {
      console.error("Error selecting database:", error);
      connection.end();
      process.exit(1);
    }

    // Now create tables
    // Drop tables in reverse dependency order (child tables first, then parent tables)
    const SQLSTATEMENT = `
DROP TABLE IF EXISTS UserRecipes;
DROP TABLE IF EXISTS UserBadges;
DROP TABLE IF EXISTS UserCompletion;
DROP TABLE IF EXISTS WellnessChallenge;
DROP TABLE IF EXISTS Recipes;
DROP TABLE IF EXISTS Badges;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS ChefRanks;

CREATE TABLE ChefRanks (
  rank_id INT AUTO_INCREMENT PRIMARY KEY,
  rank_name VARCHAR(255) NOT NULL,
  min_points INT NOT NULL,
  special_ability VARCHAR(255)
);

CREATE TABLE User (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  points INT DEFAULT 0,
  current_rank_id INT,
  FOREIGN KEY (current_rank_id) REFERENCES ChefRanks(rank_id)
);

CREATE TABLE WellnessChallenge (
  challenge_id INT AUTO_INCREMENT PRIMARY KEY,
  creator_id INT NOT NULL,
  description TEXT NOT NULL,
  points INT NOT NULL,
  FOREIGN KEY (creator_id) REFERENCES User(user_id)
);

CREATE TABLE UserCompletion (
  completion_id INT AUTO_INCREMENT PRIMARY KEY,
  challenge_id INT NOT NULL,
  user_id INT NOT NULL,
  details TEXT,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (challenge_id) REFERENCES WellnessChallenge(challenge_id),
  FOREIGN KEY (user_id) REFERENCES User(user_id)
);

CREATE TABLE Badges (
  badge_id INT AUTO_INCREMENT PRIMARY KEY,
  badge_name VARCHAR(255) NOT NULL,
  description TEXT
);

CREATE TABLE UserBadges (
  user_id INT NOT NULL,
  badge_id INT NOT NULL,
  earned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, badge_id),
  FOREIGN KEY (user_id) REFERENCES User(user_id),
  FOREIGN KEY (badge_id) REFERENCES Badges(badge_id)
);

CREATE TABLE Recipes (
  recipe_id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_name VARCHAR(255) NOT NULL,
  description TEXT,
  required_points INT
);

CREATE TABLE UserRecipes (
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, recipe_id),
  FOREIGN KEY (user_id) REFERENCES User(user_id),
  FOREIGN KEY (recipe_id) REFERENCES Recipes(recipe_id)
);

-- Insert Chef Ranks
INSERT INTO ChefRanks (rank_name, min_points, special_ability) VALUES
('Kitchen Novice', 0, 'Basic cooking tools'),
('Apprentice Chef', 100, 'Unlock recipe creation'),
('Sous Chef', 300, 'Team challenge bonuses'), 
('Master Chef', 600, 'Custom challenge creation'),
('Grand Gastromancer', 1000, 'Legendary status');

-- insert sample users (no password - for api testing only)
INSERT INTO User (username, points, current_rank_id) VALUES
('chef_john', 0, 1),
('baking_lover', 0, 1),
('healthy_guy', 0, 1);

-- Insert sample challenges (Cooking-themed wellness challenges)
INSERT INTO WellnessChallenge (creator_id, description, points) VALUES
(1, 'Hydrate like a chef – Drink 8 glasses of water to stay sharp in the kitchen', 10),
(1, 'Walk to the market – Take 10,000 steps to gather fresh ingredients', 15),
(2, 'Rest well to cook well – Get 7+ hours of sleep for better kitchen focus', 10);

-- Insert sample badges
INSERT INTO Badges (badge_name, description) VALUES
('First Challenge', 'Complete your first wellness challenge'),
('Water Master', 'Master of hydration challenges'),
('Fitness Star', 'Love being active');

-- Insert sample recipes
INSERT INTO Recipes (recipe_name, description, required_points) VALUES
('Fruit Smoothie', 'Healthy fruit blend for energy', 50),
('Energy Balls', 'Quick snacks for busy days', 100);
`;

    connection.query(SQLSTATEMENT, (error, results, fields) => {
      if (error) {
        console.error("Error creating tables:", error);
        connection.end();
        process.exit(1);
      } else {
        console.log("All tables created successfully!");
        connection.end();
        process.exit(0);
      }
    });
  });
});
