// REQUIRES
const env = require('dotenv').config({ path:"./.ENV" });
const session = require('express-session');
const fs = require('fs');
const https = require('https');
const devDebug = require ('./public/js/dev-debug.js');
// Path support
const path = require('path');
const { URLSearchParams } = require('url');


// EXPRESS SETUP
const express = require('express');
const app = express();
const options = {
    key: fs.readFileSync(env.parsed.KEY_PATH),
    cert: fs.readFileSync(env.parsed.CERT_PATH),
    passphrase: env.parsed.PASSPHRASE
};
const server = https.createServer(options, app);
const port = 3000;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//can use this to listen for events on the router
server.listen(port, () => {
    console.log(`Server running on https://localhost:${port}`);
})

// view engine support - NEED TO MOVE OUT OF THIS JS
const pug = require('pug');
const compiledFunc = pug.compileFile('./views/layout.pug');

// JSON Support
app.use(express.json());

// Expose Public file
app.use(express.static('public'));

//session support
app.use(session({
    // CHANGE THIS TO A SECRET KEY
    secret: 'your_session_secret',
    resave: false,
    saveUninitialized: true
}))

// DISCORD SETUP
const discordRouter = require('./routes/discord.js');
app.use('/', discordRouter.discordRouter);

// Default test get route
app.get('/', (req, res) => {
    res.send(compiledFunc({
        path: 'Devin'
    }));
});
