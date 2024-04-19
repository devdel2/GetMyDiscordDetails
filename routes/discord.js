 // #region REQUIRE STMNTS

const env = require('dotenv').config(({ path:"./.ENV"})).parsed;
const axios = require('axios');
const discordRouter = require('express').Router();

// #endregion

// #region CLIENT SETUP

const clientSecret = env.CLIENT_SECRET;
const clientID = env.CLIENT_ID;
const redirectURI = env.REDIRECT_URI;

// #endregion

// #region DISCORD ENV

const discordAuthorize = env.DISCORD_AUTH_ROUTE
const discordRedirect  = env.DISCORD_REDIRECT_ROUTE
const discordUserInfo = env.DISCORD_USER_ROUTE
const discordOAuthToken = env.DISCORD_OAUTH_TOKEN

//#endregion

// #region SCOPE/AUTH SETUP

// Scopes sent to discord Auth server to determine access level
const scopes = {
    identify: "identify",
    connections: "connections"
};

const discordOAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code&scope=${encodeURIComponent(`${scopes.identify} ${scopes.connections}`)}`

const authorizationHeader = {
    headers: {
        Authorization: '',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
}

//#endregion

// #region AXIOS DISCORD API REQUESTS

    // Axios request to get user information from discord api
    const UserInfoRequest = (authHeader, req, res) => {
        axios.get('https://discord.com/api/v9/users/@me', authHeader)
            .then(response => {
                req.session.userData = response.data;
                res.redirect('/GetUserConnections')
            })
            .catch(error => {
                console.error('Error getting user information:', error.stack);
                res.redirect('/UserInformation');
        });
    }

    // Axios request to get user connections from discord api
    const UserConnectionsRequest = (authHeader, req, res) => {
        axios.get('https://discord.com/api/v9/users/@me/connections', authHeader)
        .then(response => {
            req.session.userConnections = response.data;
            res.redirect('/UserInformation');
        })
        .catch(error => {
            console.error('Error getting user connections', error.stack);
            res.redirect('/UserInformation');
        })
    }

// #endregion

// #region DISCORD ROUTES

// #Discord Authorization
discordRouter.get(discordAuthorize, (req, res) => {
    res.redirect(discordOAuthUrl);
});

// Discord Auth-Token Exchange
discordRouter.get(discordRedirect, async (req,res) => {
    //gather the auth code from OAuth
    const { code } = req.query;

    //check that the code exists
    if(!code) {
        return res.status(400).send('Authorization code not provided.');
    }

    // try to exchange auth code for access token
    try {
        const discordResponse = await axios.post(discordOAuthToken,
            new URLSearchParams ({
                client_id: clientID,
                client_secret: clientSecret,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectURI,
                scope: `${scopes.identify} ${scopes.connections}`
            }), {
                headers: {
                    Authorization: `Basic ${Buffer.from(`${clientID}:${clientSecret}`).toString('base64')}`,
                }
            });
        
        // need to move this next part into it's own function
        const { access_token } = discordResponse.data;
        req.session.access_token = access_token.trim();

        // const authorizationHeader = {
        //     headers: {
        //         Authorization: `Bearer ${req.session.access_token}`,
        //         'Content-Type': 'application/x-www-form-urlencoded'
        //     }
        // };
        authorizationHeader.headers.Authorization = `Bearer ${req.session.access_token}`;
        
        // get request to the discord api for the identity scope object
        UserInfoRequest(authorizationHeader, req, res);

        //UserConnectionsRequest(authorizationHeader, req, res);

    }
    catch (err) {
        console.error('Error exchanging authorization code for access token', err);
        res.status(500).send('Error exchanging authorization code for access token');
    }
});

// Discord Route to display user information on web page
discordRouter.get(discordUserInfo, (req,res) => {
    const { access_token } = req.session;
    const userData = req.session;
    if(!access_token){
        return res.status(400).send('Access token not found in session');
    }
    try{
        res.render('discord-details', {userData});
    }
    catch (err) {
        res.status(500).send("There was an error getting your user information.");
        console.error(`The error occured at: ${err.stack}`)
    }
});

discordRouter.get('/GetUserConnections', (req, res) => {
    UserConnectionsRequest(authorizationHeader, req, res);
})

// #endregion

module.exports = { discordRouter }

//THIS IS A TEST!