 // REQUIRE STMNTS
const env = require('dotenv').config(({ path:"./.ENV"}));
const app = require('../app.js');

// CLIENT SETUP
const clientSecret = env.parsed.CLIENT_SECRET;
const clientID = env.parsed.CLIENT_ID;
const redirectURI = env.parsed.REDIRECT_URI;

// Discord Routes
const discordAuthorize = env.parsed.DISCORD_AUTH_ROUTE
const discordRedirect  = env.parsed.DISCORD_REDIRECT_ROUTE
const discordUserInfo = env.parsed.DISCORD_USER_ROUTE
const discordOAuthToken = env.parsed.DISCORD_OAUTH_TOKEN

// Scopes sent to discord Auth server to determine access level
const scopes = {
    identify: "identify",
};
const discordOAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code&scope=${encodeURIComponent(scopes.identify)}`

// Discord Authroization
app.get(discordAuthorize, (req, res) => {
    res.redirect(discordOAuthUrl);
});

// Discord Auth-Token Exchange
// *** NEED TO CHANGE THIS ROUTE TO MAKE SENSE
app.get(discordRedirect, (req,res) => {
    //gather the auth code from OAuth
    const { code } = req.query;

    //check that the code exists
    if(!code) {
        return res.status(400).send('Authorization code not provided.');
    }

    // try to exchange auth code for access token
    try {
        const discordResponse = await.post(discordOAuthToken, new URLSearchParams ({
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
                res.redirect('/UserInformation');
        });

    }
    catch (err) {
        console.error('Error exchanging authorization code for access token', err);
        res.status(500).send('Error exchanging authorization code for access token');
    }
})