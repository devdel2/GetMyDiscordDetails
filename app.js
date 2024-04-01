
const env = require('dotenv').config({ path:"./.ENV" });
const axios = require('axios');
const session = require('express-session');
const fs = require('fs');
const https = require('https');

// EXPRESS SETUP
const express = require('express');
const app = express();
const options = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
    passphrase: 'x1t6w3f8u!!!'
};
const server = https.createServer(options, app);
const port = 3000;

server.listen(port, () => {
    console.log(`Server running on https://localhost:${port}`);
})

// view engine support - NEED TO MOVE OUT OF THIS JS
const pug = require('pug');
const compiledFunc = pug.compileFile('./views/layout.pug');

// Path support
const path = require('path');
const { URLSearchParams } = require('url');

// JSON Support
app.use(express.json());

//session support
app.use(session({
    secret: 'your_session_secret',
    resave: false,
    saveUninitialized: true
}))

// DISCORD SETUP

//client secret and ID
const clientSecret = env.parsed.CLIENT_SECRET;
const clientID = env.parsed.CLIENT_ID;
const redirectURI = env.parsed.REDIRECT_URI;
const discordJS = require('discord.js');

console.log(redirectURI)

app.get('/DiscordAuth', (req, res) => {
    const scopes = 'identify rpc';
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
                'Content-Type' : 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${clientID}:${clientSecret}`).toString('base64')}`,
            }
        });
        
        const { access_token } = response.data;
        req.session.access_token = access_token;
        console.log(req.session.access_token);

        // // USE ACCESS TOKEN HERE TO CHANGE STATUS
        // //CHANGE STATUS TO ONLINE
       
        const authorizationHeader = {
            headers: {
              Authorization: `Bearer ${req.session.access_token}`
            }
          };

        axios.patch('https://discord.com/api/v9/users/@me/settings', {
            status: 'online'
            }, authorizationHeader)
            .then(response => {
                console.log('User settings updated:', response.data);
                res.redirect('/success');
            })
            .catch(error => {
                console.error('Error updating user settings:', error.stack);
                res.redirect('/');
        });
        
    }
    catch (err) {
        console.error('Error exchanging authorization code for access token', err);
        res.status(500).send('Error exchanging authorization code for access token');
    }
});

app.get('/success', (req,res) => {
    const { access_token } = req.session;
    if(!access_token){
        return res.status(400).send('Access toekn not found in session');
    }

    res.send('Authorization successful! You can close this window.');
})


// Default test get route
app.get('/', (req, res) => {
    res.send(compiledFunc({
        path: 'Devin'
    }));
});

// broadcast message on router
// app.listen(port, () => {
//     console.log(`example app listening on port ${port}`);
// });
