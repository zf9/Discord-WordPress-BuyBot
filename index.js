const Discord = require("discord.js");
const chalk = require('chalk'); // npm i chalk@4.1.2

const InitialFunction = require('./InitialFunction/Main.js');
const Config = require('./Config/MainConfig.json')


const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildModeration,
        Discord.GatewayIntentBits.GuildEmojisAndStickers, Discord.GatewayIntentBits.GuildIntegrations,
        Discord.GatewayIntentBits.GuildWebhooks, Discord.GatewayIntentBits.GuildInvites,
        Discord.GatewayIntentBits.GuildVoiceStates, Discord.GatewayIntentBits.GuildMessageReactions,
        Discord.GatewayIntentBits.GuildMessageTyping, Discord.GatewayIntentBits.DirectMessages,
        Discord.GatewayIntentBits.DirectMessageReactions, Discord.GatewayIntentBits.DirectMessageTyping,
        Discord.GatewayIntentBits.GuildScheduledEvents, Discord.GatewayIntentBits.GuildPresences,
        Discord.GatewayIntentBits.GuildMembers, Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent
    ],
    partials: [
        Discord.Partials.Channel, Discord.Partials.GuildMember, Discord.Partials.GuildScheduledEvent,
        Discord.Partials.Message, Discord.Partials.Reaction, Discord.Partials.ThreadMember, Discord.Partials.User
    ]
});

(async () => {
    await InitialFunction.LoadEvents(client);
    await InitialFunction.LoadCommands(client);
    await InitialFunction.LoadSlashCommands(client);

    await client.login(Config.DiscordToken);


})();
