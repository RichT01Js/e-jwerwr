const { Client, Intents } = require('discord.js');

global.client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

// Daha sonra kodunuzun devamı


client.config = require('./config');

require('./src/loader');

client.login(process.env.token);