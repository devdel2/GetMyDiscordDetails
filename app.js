// -------- REQUIRES --------
const env = require('dotenv').config({ path:"./.ENV" });
const session = require('express-session');
const fs = require('fs');
const https = require('https');
const path = require('path');
const pug = require('pug');


// -------- EXPRESS SETUP --------
// Import and options
const express = require('express');
const app = express();
const options = {
    key: fs.readFileSync(env.parsed.KEY_PATH),
    cert: fs.readFileSync(env.parsed.CERT_PATH),
    passphrase: env.parsed.PASSPHRASE
};

// Create server and port vars
const server = https.createServer(options, app);
const port = 3000;

// set application view engine, JSON Support, & Public Dir.
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
const compiledFunc = pug.compileFile('./views/layout.pug');
app.use(express.json());
app.use(express.static('public'));

// Server Listener
server.listen(port, () => {
    console.log(`Server running on https://localhost:${port}`);
})


// -------- SESSION SETUP --------
app.use(session({
    // CHANGE THIS TO A SECRET KEY
    secret: 'your_session_secret',
    resave: false,
    saveUninitialized: true
}))


// -------- DISCORD ROUTES --------
const discordRouter = require('./routes/discord.js');
app.use('/', discordRouter.discordRouter);


// -------- TEST ROUTE --------
app.get('/', (req, res) => {
    res.send(compiledFunc({
        path: 'Devin'
    }));
});
