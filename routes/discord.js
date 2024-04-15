 // REQUIRE STMNTS
const env = require('dotenv').config(({ path:"./.ENV"})).parsed;
const axios = require('axios');
const discordRouter = require('express').Router();

// CLIENT SETUP
const clientSecret = env.CLIENT_SECRET;
const clientID = env.CLIENT_ID;
const redirectURI = env.REDIRECT_URI;

// Discord Routes
const discordAuthorize = env.DISCORD_AUTH_ROUTE
const discordRedirect  = env.DISCORD_REDIRECT_ROUTE
const discordUserInfo = env.DISCORD_USER_ROUTE
const discordOAuthToken = env.DISCORD_OAUTH_TOKEN

// Scopes sent to discord Auth server to determine access level
const scopes = {
    identify: "identify",
};
const discordOAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code&scope=${encodeURIComponent(scopes.identify)}`

// Discord Authroization
discordRouter.get(discordAuthorize, (req, res) => {
    res.redirect(discordOAuthUrl);
});

// Discord Auth-Token Exchange
// *** NEED TO CHANGE THIS ROUTE TO MAKE SENSE
discordRouter.get(discordRedirect, async (req,res) => {
    //gather the auth code from OAuth
    const { code } = req.query;

    //check that the code exists
    if(!code) {
        return res.status(400).send('Authorization code not provided.');
    }

    // try to exchange auth code for access token
    try {
        const discordResponse = await axios.post(discordOAuthToken, new URLSearchParams ({
            client_id: clientID,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectURI,
            scope: scopes.identify
        }), {
            headers: {
                Authorization: `Basic ${Buffer.from(`${clientID}:${clientSecret}`).toString('base64')}`,
            }
        });
        
        // need to move this next part into it's own function
        const { access_token } = discordResponse.data;
        req.session.access_token = access_token.trim();

        const authorizationHeader = {
            headers: {
                Authorization: `Bearer ${req.session.access_token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        
        // get request to the discord api for the identity scope object
        axios.get('https://discord.com/api/v9/users/@me', authorizationHeader)
            .then(response => {
                req.session.userData = response.data;
                res.redirect('/UserInformation');
            })
            .catch(error => {
                console.error('Error updating user settings:', error.stack);
                res.redirect('/UserInformation');
        });

    }
    catch (err) {
        console.error('Error exchanging authorization code for access token', err);
        res.status(500).send('Error exchanging authorization code for access token');
    }
});

// Discord Route to display user information on web page
discordRouter.get('/UserInformation', (req,res) => {
    const { access_token } = req.session;
    const reqData = req.session;
    if(!access_token){
        return res.status(400).send('Access token not found in session');
    }
    try{
        res.render('discord-details', {reqData});
    }
    catch (err) {
        res.status(500).send("There was an error getting your user information.");
        console.error(`The error occured at: ${err.stack}`)
    }
});

module.exports = { discordRouter }