
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

console.log(redirectURI)

app.get('/DiscordAuth', (req, res) => {
    const scopes = 'identify';
    const discordOAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code&scope=${encodeURIComponent(scopes)}`;
    res.redirect(discordOAuthUrl);
});

app.get('/ChangeDiscordStatus', async (req, res) => {
    console.log(req.query);
    const { code } = req.query;
    if(!code) {
        return res.status(400).send('Authorization code not provided');
    }

    try {
        const response = await axios.post('https://discord.com/api/oauth2/token', {
            client_id: clientID,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectURI,
            scope: 'identify'
        });
        const { access_token } = response.data;

        req.session.access_token = access_token;

        // USE ACCESS TOKEN HERE TO CHANGE STATUS
        //CHANGE STATUS TO ONLINE
        // await axios.patch('https://discord.com/api/v9/users/@me/settings', {
        //     status: 'online'
        // }, {
        //     headers: {
        //         Authorization: `Bearer ${access_token}`
        //     }
        // });

        res.redirect('/success');
    }
    catch (err) {
        console.error('Error exchanging authorization code for access token: ', err);
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
