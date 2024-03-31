// EXPRESS SETUP
const express = require('express');
const app = express();
const port = 3000;

// view engine support - NEED TO MOVE OUT OF THIS JS
const pug = require('pug');
const compiledFunc = pug.compileFile('./views/layout.pug');

// Path support
const path = require('path');

// JSON Support
app.use(express.json());

// Discord.js Setup
const { Client, Intents } = require('discord.js');
const  discordb  = require('./public/js/discord-bot');

console.log(discordb.SayHello)

// Default test get route
app.get('/', (req, res) => {
    res.send(compiledFunc({
        path: 'Devin'
    }));
});

// Get method to get the target user's curernt status
app.get('/user-status/:userID', async (req, res) => {
    const { userID } = req.params;
    try{
        const user = await client.users.fetch(userID);
        const status = user.presense.status;
        res.status(200).json({ status });
    }
    catch (err) {
        //internal err message
        console.error(`Error fetching user status: ${err}`);
        //rendered err message
        res.status(500).send(`Error fetching user status.`);
    }
});

// broadcast message on router
app.listen(port, () => {
    console.log(`example app listening on port ${port}`);
});
