*** Culinary Adventure Quest - Wellness Challenge API ***

A gamified wellness challenge system where players complete cooking-themed wellness activities to earn points, level up through chef ranks and unlock healthy recipes. 

*** Overview ***

Culinary Adventure Quest transforms wellness activities into cooking challenges. Players complete wellness tasks framed as culinary quests (e.g., "Hydrate like a chef", "Walk to the market") to earn points and progress through chef ranks from Kitchen Novice(lowest) to Grand Gastromancer(highest).


*** CA2 – Login & Register ***

- **Frontend**: Simple, user-friendly login and register pages in the `public` folder (HTML, CSS, JS). Served at the root when you run the server.
- **Typography**: Site-wide font is **Google Font – Schoolbell** (landing page, forms, and all app pages).
- **Logo**: The top-left of the nav bar uses the image `public/images/weblogo.png` as the site logo (no text; image only).
- **Auth**: JWT for session management; bcrypt for password hashing on the backend.
- **Pages**: 
  - `index.html` – Home page with login/register links
  - `login.html` – Log in with username OR email
  - `register.html` – Sign up with username, email, password
  - `dashboard.html` – Dashboard with profile, leaderboard, Chef's Recipe Book
  - `challenges.html` – **Kitchen Quests**: all challenges with category tabs (Kitchen Prep, Market Run, Chef's Rest, Recipe Research, Seasonal Specials)
  - `recipe-book.html` – **Chef's Cookbook**: unlocked/locked recipes (unlock by earning points)
  - `progress.html` – **My Culinary Journey**: progress overview, completed quests, links to Recipe Book/Badges
  - `create-challenge.html` – **Create Kitchen Quest**: form with Quest Category, Suggested Cooking Time
  - `badges.html` – **Chef's Achievements**: earned and available badges

*** Wellness Challenge Management ***

**Create Challenges**:
- Users can create cooking-themed wellness challenges
- Set point rewards (1-100 points)
- Challenges are validated to ensure they're cooking-themed

**Track Progress**:
- View all completed challenges with dates and points
- See total points earned and challenges completed
- Monitor progress toward next chef rank

**Earn Points & Badges**:
- Complete challenges to earn points
- Points automatically added to user profile
- Badges awarded for milestones (e.g., "First Challenge" badge for first completion)
- View all earned badges with earned dates

**Gamification Features** (from CA1):
- **Chef Ranks**: Progress from Kitchen Novice → Apprentice Chef → Sous Chef → Master Chef → Grand Gastromancer
- **Leaderboard**: See top 10 players by points
- **Badges System**: Earn achievements for completing challenges
- **Points System**: All challenges award points based on difficulty

**Recipe Unlock System** (game feature):
- Users unlock virtual recipes by earning points (e.g. 50 pts → Beginner Smoothie, 150 → Protein Power Bowl, 300 → Master Chef Salad).
- Recipe cards "light up" when unlocked; locked recipes show unlock threshold.
- Dashboard shows Chef's Recipe Book snippet; full list on Recipe Book page. No ingredients or pantry—unlock is points-only.

**Challenge Categories** (cooking themes):
- **Kitchen Prep** – Morning routines (hydration, stretching)
- **Market Run** – Physical activity (steps, exercise)
- **Chef's Rest** – Sleep & mental wellness
- **Recipe Research** – Learning/reading challenges
- **Seasonal Specials** – Time-limited quests
- Kitchen Quests page has category tabs; filtering is by keyword in description until challenges have category_id in DB.


*** Validation ***

**Client-side validation** (instant feedback in UI):
- Username: 3-20 characters, alphanumeric and underscores only
- Email: Must contain @ and valid domain format
- Password strength indicator with real-time feedback
- Password requirements: min 8 chars, uppercase, lowercase, number, special character

**Server-side validation** (checked after submission):
- Username format and uniqueness
- Email format and uniqueness  
- Password strength rules enforced
- Appropriate error messages returned

*** Setup ***

1. **Dependencies**: `npm install`
2. **Database**: create a free Postgres database at [neon.tech](https://neon.tech) and copy the **pooled** connection string.
3. **Environment**: copy `.env.example` to `.env`, then set `DATABASE_URL` to that connection string and `JWT_SECRET_KEY` to a long random value. Generate one with:
   `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
4. **Create the tables**: `npm run migrate`. This creates every table and seeds the reference data (chef ranks, badges, recipes, categories and three sample challenges). It is safe to run more than once.
5. **Start server**: `npm run dev` or `npm start`. Server runs on port 3000.
6. **Frontend**: Open `http://localhost:3000` in a browser. Use Register to create an account, then Log in. The API info is at `GET /api`.

*** Testing ***

- `npm test` – end to end tests. Starts the real server against the database in `DATABASE_URL` and walks the full journey: browse as a visitor, register, log in, create and complete a challenge, earn points and badges, unlock a recipe. It cleans up everything it creates.
- `npm run smoke` – read-only checks against an already running server. Point it at a deployment with `BASE_URL=https://your-app.onrender.com npm run smoke`.

*** Deployment ***

The app runs on [Render](https://render.com) (free tier) with the database on [Neon](https://neon.tech) (free tier).

| Piece | Where | Notes |
|---|---|---|
| Web server | Render web service | Built from `render.yaml`, auto-deploys on every push to `main` |
| Database | Neon Postgres | Connection string lives in Render's Environment tab, never in the repo |
| Tests | GitHub Actions (`.github/workflows/ci.yml`) | Every push and pull request |

**How a change reaches production**

1. Push to `main`.
2. GitHub Actions creates a throwaway Neon branch (a copy of the real database), runs the migration and the full test suite against it, then deletes the branch. Production data is never touched.
3. Render sees the push, runs `npm ci && npm run migrate`, and starts the new version. Because migrations run at build time, a broken migration fails the deploy instead of taking the live site down.

**Environment variables to set in the Render dashboard**

`DATABASE_URL`, `JWT_SECRET_KEY`, `JWT_EXPIRES_IN`, `JWT_ALGORITHM`.

**GitHub Actions secrets** (Settings > Secrets and variables > Actions)

`NEON_API_KEY` and `NEON_PROJECT_ID`. Without them the workflow still installs and syntax-checks the code, but skips the database tests and says so.

*** Features ***

- **User Management**: Register/login with email and password (CA2)
- **Wellness Challenges**: Create and complete cooking-themed wellness challenges
- **Progress Tracking**: View completed challenges, total points, and rank progression
- **Challenge Creation**: Design custom challenges for the community
- **Badges System**: Earn badges for completing challenges and reaching milestones
- **Chef Ranks**: Automatic rank progression based on points (Kitchen Novice → Grand Gastromancer)
- **Leaderboard**: View top players by points
- **User Profiles**: Detailed statistics including rank, points, and challenges completed


*** API Documentation ***

** Endpoints **

* Root and frontend
- GET / – Serves the frontend (index.html). Use this in the browser to access login/register pages.
- GET /api – API information (json)
  
---

** AUTH (CA2) **

* Register
- POST /auth/register
  - Request Body: `{ "username": "chef_alice", "email": "alice@example.com", "password": "SecurePass1!" }`
  - Password must have: min 8 chars, uppercase, lowercase, number, special character
  - Success (201): `{ "message": "Registration successful", "user_id", "username", "email", "points", "rank" }`
  - Errors: 400 (validation failed), 409 (username/email exists), 500

* Login
- POST /auth/login
  - Request Body: `{ "identifier": "chef_alice", "password": "SecurePass1!" }`
  - Note: `identifier` can be username OR email
  - Success (200): `{ "token": "<jwt>" }`
  - Errors: 400 (identifier/password required), 401 (invalid credentials), 500

---

** USERS **

* Create User : POST /users

* Get All Users : GET /users

* Get User by ID : GET /users/:id
  
* Update User : PUT /users/:id
---


** CHALLENGES **

* Create Challenge : POST /challenges

* Get All Challenges : GET /challenges
  
* Update Challenge : PUT /challenges/:id

* Delete Challenge : DELETE /challenges/:id
---


** COMPLETIONS **

* Complete a Challenge : POST /challenges/:challenge_id/completions

* Get Completions by Challenge : GET /challenges/:challenge_id/completions
---


** GAMES **

* Get User Profile : GET /games/profile/:userId

* Get Leaderboard : GET /games/leaderboard

* Get User's Completed Challenges (CA2) : GET /games/user/:userId/challenges

* Get User's Earned Badges (CA2) : GET /games/user/:userId/badges

* Get All Available Badges (CA2) : GET /games/badges
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

- Models and controllers use callbacks throughout (no Promises or async/await). The database is Postgres; `src/services/db.js` keeps the callback API the rest of the code was written against and translates the SQL underneath, so the models stayed readable when the app moved off MySQL.
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

---

## ERD Changes 
The database structure was updated to better support user management, security, and data tracking. The User table was enhanced by adding email and password fields to allow proper authentication and ensure each user is uniquely identifiable. Primary keys were updated to use auto-increment for easier record management, and timestamp defaults were added to tables such as UserCompletion, UserBadges, and UserRecipes to automatically track when actions occur. The overall relationships between users, challenges, badges, recipes, and ranks remain the same, but the updated schema improves data integrity, scalability, and real-world usability.
