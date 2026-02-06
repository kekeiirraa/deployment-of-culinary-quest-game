// server entry point
// starts the express application and listens for incoming requests

require('dotenv').config();
const app = require('./app');
// port number the server will listen on (default 3000)
const port = 3000;

// start server and listen on port; log when ready to accept connections
app.listen(port, () => {
  console.log(`Wellness game server running on port ${port}`);
});
