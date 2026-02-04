// migration: add recipe unlock system, challenge categories, and pantry (ingredients)
// run after initTables: node src/configs/addRecipeSystem.js

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'QWEasd123',
  database: process.env.DB_NAME || 'food',
  multipleStatements: true
});

// run one query; on duplicate/exists errors, continue
function run(sql, cb) {
  connection.query(sql, (err) => {
    if (err && err.code !== 'ER_DUP_FIELD' && err.code !== 'ER_DUP_KEYNAME' && err.code !== 'ER_TABLE_EXISTS_ERROR' && err.code !== 'ER_DUP_ENTRY') {
      return cb(err);
    }
    cb(null);
  });
}

function runMigration(cb) {
  run(`CREATE TABLE IF NOT EXISTS ChallengeCategory (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(20),
    description TEXT
  )`, (err) => {
    if (err) return cb(err);
    run(`ALTER TABLE WellnessChallenge ADD COLUMN category_id INT NULL`, (err2) => {
      if (err2) { /* column may already exist */ }
      run(`CREATE TABLE IF NOT EXISTS Ingredient (
        ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(20),
        type VARCHAR(50)
      )`, (err3) => {
        if (err3) return cb(err3);
        run(`CREATE TABLE IF NOT EXISTS UserIngredient (
          user_id INT NOT NULL,
          ingredient_id INT NOT NULL,
          quantity INT DEFAULT 0,
          PRIMARY KEY (user_id, ingredient_id),
          FOREIGN KEY (user_id) REFERENCES User(user_id),
          FOREIGN KEY (ingredient_id) REFERENCES Ingredient(ingredient_id)
        )`, (err4) => {
          if (err4) return cb(err4);
          run(`CREATE TABLE IF NOT EXISTS RecipeIngredient (
            recipe_id INT NOT NULL,
            ingredient_id INT NOT NULL,
            quantity INT DEFAULT 1,
            PRIMARY KEY (recipe_id, ingredient_id),
            FOREIGN KEY (recipe_id) REFERENCES Recipes(recipe_id),
            FOREIGN KEY (ingredient_id) REFERENCES Ingredient(ingredient_id)
          )`, (err5) => {
            if (err5) return cb(err5);
            run(`CREATE TABLE IF NOT EXISTS RecipeReview (
              review_id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              recipe_id INT NOT NULL,
              rating INT NOT NULL,
              comment TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES User(user_id),
              FOREIGN KEY (recipe_id) REFERENCES Recipes(recipe_id)
            )`, (err6) => {
              if (err6) return cb(err6);
              seedData(cb);
            });
          });
        });
      });
    });
  });
}

function seedData(cb) {
  run(`INSERT IGNORE INTO ChallengeCategory (category_id, name, icon, description) VALUES
    (1, 'Kitchen Prep', '📋', 'Morning routines: hydration, stretching'),
    (2, 'Market Run', '🏃', 'Physical activity: steps, exercise'),
    (3, 'Chef''s Rest', '😴', 'Sleep & mental wellness'),
    (4, 'Recipe Research', '📚', 'Learning and reading challenges'),
    (5, 'Seasonal Specials', '🎯', 'Time-limited quests')`, (err) => {
    if (err) return cb(err);
    run(`INSERT IGNORE INTO Ingredient (ingredient_id, name, icon, type) VALUES
      (1, 'Fresh Berries', '🫐', 'fruit'),
      (2, 'Leafy Greens', '🥬', 'vegetable'),
      (3, 'Protein Boost', '🥩', 'protein'),
      (4, 'Whole Grains', '🌾', 'grain'),
      (5, 'Chef''s Spirit', '✨', 'special')`, (err2) => {
      if (err2) return cb(err2);
      // ensure recipes exist with required_points 50, 150, 300
      connection.query(`INSERT INTO Recipes (recipe_id, recipe_name, description, required_points) VALUES
        (1, 'Beginner Smoothie', 'A refreshing fruit blend to start your day like a chef', 50),
        (2, 'Protein Power Bowl', 'Hearty bowl with greens and protein for sustained energy', 150),
        (3, 'Master Chef Salad', 'Elevated salad with grains and chef-style flair', 300)
        ON DUPLICATE KEY UPDATE recipe_name = VALUES(recipe_name), description = VALUES(description), required_points = VALUES(required_points)`, (err4) => {
        if (err4) console.warn('Recipe seed warning:', err4.message);
        cb(null);
      });
    });
  });
}

connection.connect((err) => {
  if (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
  runMigration((err) => {
    if (err) {
      console.error('Migration failed:', err);
      connection.end();
      process.exit(1);
    }
    console.log('Recipe system migration done.');
    connection.end();
    process.exit(0);
  });
});
