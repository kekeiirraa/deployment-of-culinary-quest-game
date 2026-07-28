// end to end api tests
// starts the real express app, talks to a real postgres database, and walks
// through the whole user journey: browse challenges as a visitor, register,
// log in, create a challenge, complete it, earn points/badges, unlock a recipe.
//
// run with: npm test   (needs DATABASE_URL in .env or the environment)

const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

const app = require('../app');
const db = require('../src/services/db');
const { migrate } = require('../src/configs/migrate');

let server;
let baseUrl;

// unique-per-run identity so repeated runs never collide on the unique username
const suffix = Date.now().toString().slice(-8);
const testUser = {
    username: 'ci_' + suffix,
    email: 'ci_' + suffix + '@example.com',
    password: 'TestPass1!'
};

let userId;
let token;
let challengeId;

// small helper so every test reads the same way
async function api(method, path, body) {
    const options = { method, headers: {} };
    if (body !== undefined) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }
    const response = await fetch(baseUrl + path, options);
    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        data = text; // static html pages
    }
    return { status: response.status, body: data };
}

test.before(async () => {
    await migrate(); // make sure the schema exists before anything runs
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = 'http://127.0.0.1:' + server.address().port;
});

test.after(async () => {
    // remove everything this run created so the database stays clean
    if (userId) {
        await db.queryAsync('DELETE FROM UserCompletion WHERE user_id = ?', [userId]);
        await db.queryAsync('DELETE FROM UserBadges WHERE user_id = ?', [userId]);
        await db.queryAsync('DELETE FROM UserRecipes WHERE user_id = ?', [userId]);
        await db.queryAsync('DELETE FROM WellnessChallenge WHERE creator_id = ?', [userId]);
        await db.queryAsync('DELETE FROM Users WHERE user_id = ?', [userId]);
    }
    if (server) await new Promise((resolve) => server.close(resolve));
    await db.end();
});

// ---------------------------------------------------------------
// what a visitor can see before signing up
// ---------------------------------------------------------------

test('serves the frontend landing page', async () => {
    const res = await api('GET', '/');
    assert.strictEqual(res.status, 200);
    assert.ok(String(res.body).includes('<'), 'expected html to be served from public/');
});

test('GET /api lists the available endpoints', async () => {
    const res = await api('GET', '/api');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.endpoints.auth);
    assert.ok(res.body.endpoints.challenges);
});

test('GET /challenges is public and returns the seeded challenges', async () => {
    const res = await api('GET', '/challenges');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 3, 'expected the seeded challenges');
    assert.ok(res.body[0].challenge, 'description should be aliased to "challenge"');
});

test('unknown routes return a 404 json error', async () => {
    const res = await api('GET', '/definitely-not-a-route');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.error, 'Route not found');
});

// ---------------------------------------------------------------
// registration and login (bcrypt + jwt)
// ---------------------------------------------------------------

test('registration rejects a weak password', async () => {
    const res = await api('POST', '/auth/register', {
        username: 'ci_weak' + suffix.slice(-4),
        email: 'weak' + suffix + '@example.com',
        password: 'password'
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error);
});

test('registration rejects a malformed email', async () => {
    const res = await api('POST', '/auth/register', {
        username: 'ci_mail' + suffix.slice(-4),
        email: 'not-an-email',
        password: 'TestPass1!'
    });
    assert.strictEqual(res.status, 400);
});

test('registration creates a user and starts them at Kitchen Novice', async () => {
    const res = await api('POST', '/auth/register', testUser);
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.username, testUser.username);
    assert.strictEqual(res.body.points, 0);
    assert.strictEqual(res.body.rank, 'Kitchen Novice');
    assert.ok(res.body.user_id, 'insertId should come back from postgres RETURNING');
    userId = res.body.user_id;
});

test('the password is stored as a bcrypt hash, never in plain text', async () => {
    const rows = await db.queryAsync('SELECT password_hash FROM Users WHERE user_id = ?', [userId]);
    const hash = rows[0].password_hash;
    assert.notStrictEqual(hash, testUser.password);
    assert.ok(hash.startsWith('$2'), 'expected a bcrypt hash');
});

test('registration rejects a duplicate username', async () => {
    const res = await api('POST', '/auth/register', testUser);
    assert.strictEqual(res.status, 409);
});

test('login fails with the wrong password', async () => {
    const res = await api('POST', '/auth/login', {
        identifier: testUser.username,
        password: 'WrongPass1!'
    });
    assert.strictEqual(res.status, 401);
});

test('login fails for a seeded demo account that has no password', async () => {
    const res = await api('POST', '/auth/login', {
        identifier: 'chef_john',
        password: 'anything'
    });
    assert.strictEqual(res.status, 401, 'should be rejected, not a 500');
});

test('login returns a valid jwt', async () => {
    const res = await api('POST', '/auth/login', {
        identifier: testUser.username,
        password: testUser.password
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);
    token = res.body.token;

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    assert.strictEqual(decoded.userId, userId);
    assert.ok(decoded.exp > Math.floor(Date.now() / 1000), 'token should not be expired');
});

test('login also works with the email address', async () => {
    const res = await api('POST', '/auth/login', {
        identifier: testUser.email,
        password: testUser.password
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);
});

// ---------------------------------------------------------------
// challenge management
// ---------------------------------------------------------------

test('creating a challenge requires all fields', async () => {
    const res = await api('POST', '/challenges', { description: 'Kitchen prep' });
    assert.strictEqual(res.status, 400);
});

test('creating a challenge rejects a description that is not cooking themed', async () => {
    const res = await api('POST', '/challenges', {
        description: 'Do twenty push ups',
        user_id: userId,
        points: 30
    });
    assert.strictEqual(res.status, 400);
});

test('creates a cooking themed challenge', async () => {
    const res = await api('POST', '/challenges', {
        description: 'Kitchen reset - wash every pan before bed',
        user_id: userId,
        points: 30
    });
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.challenge_id);
    assert.strictEqual(res.body.creator_id, userId);
    challengeId = res.body.challenge_id;
});

test('only the creator can update a challenge', async () => {
    const res = await api('PUT', '/challenges/' + challengeId, {
        description: 'Kitchen reset - someone else trying to edit',
        points: 30,
        user_id: 1 // the seeded chef_john, not the owner
    });
    assert.strictEqual(res.status, 403);
});

test('the creator updates their challenge', async () => {
    const res = await api('PUT', '/challenges/' + challengeId, {
        description: 'Kitchen reset - wash every pan and wipe the stove',
        points: 30,
        user_id: userId
    });
    assert.strictEqual(res.status, 200);

    const all = await api('GET', '/challenges');
    const updated = all.body.find((c) => c.challenge_id === challengeId);
    assert.ok(updated.challenge.includes('wipe the stove'));
});

// ---------------------------------------------------------------
// completing challenges, points, badges
// ---------------------------------------------------------------

test('completing a challenge awards its points', async () => {
    const res = await api('POST', '/challenges/' + challengeId + '/completions', {
        user_id: userId,
        details: 'Scrubbed everything'
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.points_earned, 30);
    assert.ok(res.body.complete_id);
});

test('completing a challenge that does not exist returns 404', async () => {
    const res = await api('POST', '/challenges/99999999/completions', { user_id: userId });
    assert.strictEqual(res.status, 404);
});

test('the profile reflects the new points and completion count', async () => {
    const res = await api('GET', '/games/profile/' + userId);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.points, 30);
    assert.strictEqual(res.body.challenges_completed, 1, 'COUNT() must come back as a number');
    assert.strictEqual(res.body.rank, 'Kitchen Novice');
    assert.ok(res.body.next_rank.includes('Apprentice Chef'));
});

test('the first completion awards the First Challenge badge', async () => {
    // badge awarding is fire and forget in the controller, so give it a moment
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const res = await api('GET', '/games/user/' + userId + '/badges');
    assert.strictEqual(res.status, 200);
    const names = res.body.map((b) => b.badge_name);
    assert.ok(names.includes('First Challenge'), 'expected the First Challenge badge, got ' + names.join(','));
});

test('the completed challenge list returns timestamps as strings', async () => {
    const res = await api('GET', '/games/user/' + userId + '/challenges');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(typeof res.body[0].completed_at, 'string', 'dates must stay strings for the frontend');
});

test('lists the completions for a challenge', async () => {
    const res = await api('GET', '/challenges/' + challengeId + '/completions');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.length, 1);
});

test('the leaderboard returns players ordered by points', async () => {
    const res = await api('GET', '/games/leaderboard');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.leaderboard));
    const points = res.body.leaderboard.map((p) => p.points);
    const sorted = [...points].sort((a, b) => b - a);
    assert.deepStrictEqual(points, sorted, 'leaderboard should be sorted descending');
});

// ---------------------------------------------------------------
// gamification reference data and recipe unlocking
// ---------------------------------------------------------------

test('returns all badges, recipes and categories', async () => {
    const badges = await api('GET', '/games/badges');
    assert.strictEqual(badges.status, 200);
    assert.ok(badges.body.length >= 3);

    const recipes = await api('GET', '/games/recipes');
    assert.strictEqual(recipes.status, 200);
    assert.ok(recipes.body.length >= 12);

    const categories = await api('GET', '/games/categories');
    assert.strictEqual(categories.status, 200);
    assert.ok(categories.body.length >= 5);
});

test('refuses to unlock a recipe the user cannot afford', async () => {
    // Grand Tasting Menu costs 600 points, the user has 30
    const res = await api('POST', '/games/user/' + userId + '/recipes/12/unlock');
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error.includes('Not enough points'));
});

test('unlocks an affordable recipe', async () => {
    // Morning Oat Bites costs 25 points, the user has 30
    const res = await api('POST', '/games/user/' + userId + '/recipes/4/unlock');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.recipe_id, 4);
});

test('unlocking the same recipe twice is idempotent', async () => {
    const res = await api('POST', '/games/user/' + userId + '/recipes/4/unlock');
    assert.strictEqual(res.status, 200, 'INSERT IGNORE must translate to ON CONFLICT DO NOTHING');
});

test('the recipe book shows which recipes are unlocked', async () => {
    const res = await api('GET', '/games/user/' + userId + '/recipes');
    assert.strictEqual(res.status, 200);
    const oatBites = res.body.find((r) => r.recipe_id === 4);
    const tastingMenu = res.body.find((r) => r.recipe_id === 12);
    assert.strictEqual(oatBites.unlocked, true);
    assert.strictEqual(tastingMenu.unlocked, false);
});

// ---------------------------------------------------------------
// users endpoints and cleanup
// ---------------------------------------------------------------

test('fetches a user by id', async () => {
    const res = await api('GET', '/users/' + userId);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.username, testUser.username);
});

test('fetching a user that does not exist returns 404', async () => {
    const res = await api('GET', '/users/99999999');
    assert.strictEqual(res.status, 404);
});

test('deletes the challenge along with its completions', async () => {
    const res = await api('DELETE', '/challenges/' + challengeId);
    assert.strictEqual(res.status, 204);

    const all = await api('GET', '/challenges');
    assert.ok(!all.body.some((c) => c.challenge_id === challengeId));
});
