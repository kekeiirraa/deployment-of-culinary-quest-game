*** Culinary Adventure Quest - Wellness Challenge API ***

A gamified wellness challenge system where players complete cooking-themed wellness activities to earn points and level up through chef ranks.

*** Overview ***

Culinary Adventure Quest transforms wellness activities into cooking challenges. Players complete wellness tasks framed as culinary quests (e.g., "Hydrate like a chef", "Walk to the market") to earn points and progress through chef ranks from Kitchen Novice to Grand Gastromancer.

*** CA2 – Login & Register ***

- **Frontend**: Simple login and register pages in the `public` folder (HTML, CSS, JS). Served at the root when you run the server.
- **Auth**: JWT for session management; bcrypt for password hashing on the backend.
- **Pages**: `index.html` (home), `login.html`, `register.html`. After login, the JWT is stored in `localStorage` and used for authenticated requests.

*** Setup ***

1. **Dependencies**: `npm install`
2. **Environment**: Copy `.env.example` to `.env` and set `JWT_SECRET_KEY`, `JWT_EXPIRES_IN`, `JWT_ALGORITHM` (required for auth).
3. **Database**: MySQL with database and tables from CA1. If you already have the CA1 database, run the migration to add the password column: `node src/configs/addPasswordColumn.js`. For a fresh setup, run `node src/configs/initTables.js` (schema includes `password_hash` and unique username).
4. **Start server**: `npm run dev` or `npm start`. Server runs on port 3000.
5. **Frontend**: Open `http://localhost:3000` in a browser. Use Register to create an account, then Log in. The API info is at `GET /api`.

*** Features ***

- User Management: Create and manage user accounts (register/login with password in CA2)
- Wellness Challenges: Create cooking-themed wellness challenges
- Challenge Completion: Track challenge completions and award points
- Chef Ranks: Automatic rank progression based on points
- Leaderboard: View top players by points
- User Profiles: View detailed user statistics


*** API Documentation ***

** Endpoints **

* Root and frontend
- GET / – Serves the frontend (index.html). Use this in the browser to access login/register pages.
- GET /api – API information (json)
  - Response:
    ```json
    {
      "message": "Culinary Adventure Wellness Game API",
      "version": "1.0.0",
      "endpoints": {
        "auth": "/auth",
        "users": "/users",
        "challenges": "/challenges",
        "completions": "/completions",
        "games": "/games"
      }
    }
    ```

---

** AUTH (CA2) **

* Register
- POST /auth/register
  - Request Body: `{ "username": "chef_alice", "password": "yourpassword" }`
  - Success (201): `{ "message": "Registration successful", "user_id", "username", "points", "rank" }`
  - Errors: 400 (username/password required), 409 (username exists), 500

* Login
- POST /auth/login
  - Request Body: `{ "username": "chef_alice", "password": "yourpassword" }`
  - Success (200): `{ "token": "<jwt>" }`
  - Errors: 400 (username/password required), 401 (invalid credentials), 500

---

** USERS **

* Create User 
- POST /users
  - Request Body:
    ```json
    {
      "username": "chef_alice"
    }
    ```
  - Success Response (201):
    ```json
    {
      "user_id": 1,
      "username": "chef_alice",
      "points": 0,
      "rank": "Kitchen Novice"
    }
    ```
  - Error Responses:
    - 400: Username is required
    - 409: Username already exists
    - 500: Failed to create user

* Get All Users
- GET /users
  - Success Response (200):
    ```json
    [
      {
        "user_id": 1,
        "username": "chef_alice",
        "points": 150
      },
      {
        "user_id": 2,
        "username": "baking_lover",
        "points": 75
      }
    ]
    ```

* Get User by ID
- GET /users/:id
  - Success Response (200):
    ```json
    {
      "user_id": 1,
      "username": "chef_alice",
      "points": 150
    }
    ```
  - Error Responses:
    - 404: User not found
    - 500: Database error

* Update User
- PUT /users/:id
  - Request Body:
    ```json
    {
      "username": "chef_alice_updated",
      "points": 200
    }
    ```
  - Success Response (200):
    ```json
    {
      "user_id": 1,
      "username": "chef_alice_updated",
      "points": 200
    }
    ```
  - Error Responses:
    - 400: Username and points are required
    - 404: User not found
    - 409: Username already exists
    - 500: Database error

---

** CHALLENGES **

* Create Challenge
- POST /challenges
  - Request Body:
    ```json
    {
      "description": "Rest well to cook well – Get 7+ hours of sleep for better kitchen focus",
      "user_id": 1,
      "points": 50
    }
    ```
  - Important: Challenges must be cooking-themed! Include culinary terms like "chef", "kitchen", "cook", "culinary", "market", "ingredients", etc.
  - Success Response (201):
    ```json
    {
      "challenge_id": 1,
      "challenge": "Rest well to cook well – Get 7+ hours of sleep for better kitchen focus",
      "creator_id": 1,
      "points": 50
    }
    ```
  - Error Responses:
    - 400: Description, user_id, and points are required
    - 400: Challenge must be cooking-themed (validation error)
    - 500: Failed to create challenge

* Get All Challenges
- GET /challenges
  - Success Response (200):
    ```json
    [
      {
        "challenge_id": 1,
        "challenge": "Hydrate like a chef – Drink 8 glasses of water to stay sharp in the kitchen",
        "creator_id": 1,
        "points": 10
      },
      {
        "challenge_id": 2,
        "challenge": "Walk to the market – Take 10,000 steps to gather fresh ingredients",
        "creator_id": 1,
        "points": 15
      }
    ]
    ```

* Update Challenge
- PUT /challenges/:id
  - Request Body:
    ```json
    {
      "user_id": 1,
      "description": "Updated challenge description",
      "points": 60
    }
    ```
  - Success Response (200):
    ```json
    {
      "challenge_id": 1,
      "challenge": "Updated challenge description",
      "creator_id": 1,
      "points": 60
    }
    ```
  - Error Responses:
    - 400: Description (or question), user_id, and points are required
    - 403: Forbidden - Not the challenge owner
    - 404: Challenge not found
    - 500: Database error

* Delete Challenge
- DELETE /challenges/:id
  - Success Response (204): No content
  - Error Responses:
    - 404: Challenge not found
    - 500: Failed to delete challenge

---

** COMPLETIONS **

* Complete a Challenge
- POST /challenges/:challenge_id/completions
  - Request Body:
    ```json
    {
      "user_id": 1,
      "details": "Slept 8 hours last night! Ready to cook like a master chef today!"
    }
    ```
  - Success Response (201):
    ```json
    {
      "complete_id": 1,
      "challenge_id": 1,
      "user_id": 1,
      "details": "Slept 8 hours last night! Ready to cook like a master chef today!"
    }
    ```
  - Note: Points are automatically added to the user's total
  - Error Responses:
    - 400: user_id is required
    - 404: Challenge not found
    - 404: User not found
    - 500: Database error

* Get Completions by Challenge
- GET /challenges/:challenge_id/completions
  - Success Response (200):
    ```json
    [
      {
        "user_id": 1,
        "details": "Slept 8 hours last night!"
      },
      {
        "user_id": 2,
        "details": "Got 7.5 hours of sleep"
      }
    ]
    ```
  - Error Responses:
    - 404: No completions found for this challenge
    - 500: Database error

---

** GAMES **

* Get User Profile
- GET /games/profile/:userId
  - Success Response (200):
    ```json
    {
      "user_id": 1,
      "username": "chef_alice",
      "rank": "Apprentice Chef",
      "points": 150,
      "challenges_completed": 5,
      "next_rank": "Sous Chef at 300 points"
    }
    ```
  - Error Responses:
    - 404: User not found
    - 500: Database error

* Get Leaderboard
- GET /games/leaderboard
  - Success Response (200):
    ```json
    {
      "leaderboard": [
        {
          "user_id": 1,
          "username": "chef_alice",
          "points": 500
        },
        {
          "user_id": 2,
          "username": "baking_lover",
          "points": 300
        }
      ],
      "updated": "12/15/2024, 3:45:30 PM"
    }
    ```
  - Note: Returns top 10 users by points

---

## Chef Ranks

Players progress through ranks based on total points:

| Rank               | Points Required | Special Ability |
|--------------------|------|---------------------------|
| Kitchen Novice     | 0    | Basic cooking tools       |
| Apprentice Chef    | 100  | Unlock recipe creation    |
| Sous Chef          | 300  | Team challenge bonuses    |
| Master Chef        | 600  | Custom challenge creation |
| Grand Gastromancer | 1000 | Legendary status          |

---

* Cooking-Themed Challenge Examples

* Beginner Challenges (10-30 points)
- "Kitchen Prep Master" – Organize your kitchen and prep ingredients for tomorrow
- "Hydrate like a chef" – Drink 8 glasses of water to stay sharp
- "Morning Chef Routine" – Wake up early and prepare a healthy breakfast
- "Market Walk" – Take 10,000 steps (walking to the market for ingredients)

* Intermediate Challenges (30-60 points)
- "Rest well to cook well" – Get 7+ hours of sleep for better kitchen focus
- "Chef's Workout" – Do 30 minutes of exercise before cooking
- "Garden Fresh" – Cook 3 meals using fresh vegetables today
- "Kitchen Meditation" – Practice 10 minutes of mindfulness before cooking

* Advanced Challenges (60-100 points)
- "Master Chef Marathon" – Complete 5 wellness challenges in one day
- "Culinary Wellness Week" – Maintain healthy habits for 7 consecutive days
- "Chef's Balance" – Combine exercise, sleep, and healthy eating in one day
- "Kitchen Zen" – Practice stress management techniques during meal prep

---

* Notes

- All database operations use callbacks (no Promises or async/await)
- Challenges must be cooking-themed (validated automatically)
- Points are automatically calculated and added when challenges are completed
- Chef ranks are calculated dynamically based on user points
- CA2: Passwords are hashed with bcrypt; sessions use JWT. Frontend files are in `public/` (css, js, index.html, login.html, register.html)

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- 200 - Success
- 201 - Created
- 204 - No Content 
- 400 - Bad Request 
- 403 - Forbidden 
- 404 - Not Found
- 409 - Conflict 
- 500 - Internal Server Error
