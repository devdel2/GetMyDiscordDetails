require('dotenv').config();

//bot token and channel ID
const BOT_TOKEN = process.env.BOT_TOKEN;

//data objects for Client and Intents from discord.js
const { Client, Intents } = require('discord.js');

const DiscordObject = [
//client setup
    function CreateClient(){
        const client = new Client({
            intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSSAGES],
        })
        //turning 'on' client, prints current user
        client.on('ready', () => {
            return console.log(`Logged in as ${client.user.tag}`);
        });
    },
    function SayHello() {
        return console.log("Hello");
    }
];

console.log(DiscordObject);

// client.login(BOT_TOKEN);

module.exports = {DiscordObject};