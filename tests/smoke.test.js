// post deploy smoke test
// runs against a already-running server (the live render url) and only performs
// read-only requests, so it never leaves test data behind in production.
//
// run with: BASE_URL=https://your-app.onrender.com npm run smoke

const test = require('node:test');
const assert = require('node:assert');

const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

// render free instances sleep when idle, so the first request has to wake the
// container up. retry for a while before deciding the deploy is broken.
async function get(path, { attempts = 10, waitMs = 15000 } = {}) {
    let lastError;
    for (let i = 0; i < attempts; i++) {
        try {
            const response = await fetch(baseUrl + path, { signal: AbortSignal.timeout(30000) });
            const text = await response.text();
            let body;
            try {
                body = JSON.parse(text);
            } catch (e) {
                body = text;
            }
            return { status: response.status, body };
        } catch (error) {
            lastError = error;
            console.log('  waiting for ' + baseUrl + ' to respond (attempt ' + (i + 1) + ')...');
            await new Promise((resolve) => setTimeout(resolve, waitMs));
        }
    }
    throw lastError;
}

test('the deployed api is reachable', async () => {
    const res = await get('/api');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.message, 'Culinary Adventure Wellness Game API');
});

test('the frontend is served', async () => {
    const res = await get('/');
    assert.strictEqual(res.status, 200);
    assert.ok(String(res.body).toLowerCase().includes('<!doctype html'));
});

test('static assets are served', async () => {
    const css = await get('/css/style.css');
    assert.strictEqual(css.status, 200);

    const js = await get('/js/api.js');
    assert.strictEqual(js.status, 200);
});

test('the database is connected and seeded', async () => {
    const challenges = await get('/challenges');
    assert.strictEqual(challenges.status, 200);
    assert.ok(Array.isArray(challenges.body));
    assert.ok(challenges.body.length >= 3, 'expected seeded challenges - did the migration run?');

    const recipes = await get('/games/recipes');
    assert.strictEqual(recipes.status, 200);
    assert.ok(recipes.body.length >= 12);

    const badges = await get('/games/badges');
    assert.strictEqual(badges.status, 200);
    assert.ok(badges.body.length >= 3);
});

test('the leaderboard responds', async () => {
    const res = await get('/games/leaderboard');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.leaderboard));
});

test('unknown routes return a json 404', async () => {
    const res = await get('/definitely-not-a-route');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.error, 'Route not found');
});
