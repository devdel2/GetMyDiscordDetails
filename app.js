// REQUIRES
const env = require('dotenv').config({ path:"./.ENV" });
const axios = require('axios');
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

//client secret and ID
const clientSecret = env.parsed.CLIENT_SECRET;
const clientID = env.parsed.CLIENT_ID;
const redirectURI = env.parsed.REDIRECT_URI;

console.log(redirectURI)

app.get('/DiscordAuth', (req, res) => {
    const scopes = 'identify';
    const discordOAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code&scope=${encodeURIComponent(scopes)}`;
    res.redirect(discordOAuthUrl);
});

app.get('/ChangeDiscordStatus', async (req, res) => {

    const { code } = req.query;
    if(!code) {
        return res.status(400).send('Authorization code not provided');
    }

    try {
        
        const response = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: clientID,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectURI,
            scope: 'identify rpc'
        }), {
            headers: {
                //'Content-Type' : 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${clientID}:${clientSecret}`).toString('base64')}`,
            }
        });
        const { access_token } = response.data;
        req.session.access_token = access_token.trim();
       
        const authorizationHeader = {
            headers: {
              Authorization: `Bearer ${req.session.access_token}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          };

        axios.get('https://discord.com/api/v9/users/@me', authorizationHeader)
            .then(response => {
                //add response data to user session 
                req.session.userData = response.data;
                res.redirect('/user-information', );
            })
            .catch(error => {
                console.error('Error updating user settings:', error.stack);
                res.redirect('/user-information');
        });
        
    }
    catch (err) {
        console.error('Error exchanging authorization code for access token', err);
        res.status(500).send('Error exchanging authorization code for access token');
    }
});

app.get('/user-information', (req,res) => {
    const { access_token } = req.session;
    const reqData = req.session;
    if(!access_token){
        return res.status(400).send('Access token not found in session');
    }
    res.render('discord-details', {reqData});
    // res.send((req.session));
});

// Default test get route
app.get('/', (req, res) => {
    res.send(compiledFunc({
        path: 'Devin'
    }));
});
