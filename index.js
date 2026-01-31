// server entry point
// starts the express application and listens for incoming requests

require('dotenv').config();
const app = require('./app');
// set server port number
const port = 3000;

// start server and listen on specified port
// logs message when server is ready to accept connections
app.listen(port, () => {
    console.log(`Wellness game server running on port ${port}`);
});
