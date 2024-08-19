const Config = require('../Config/MainConfig.json')


module.exports = {
    name: 'messageCreate',
    execute(message, client) {
        if (!message.content.startsWith(Config.DiscordCommandPrefix) || message.author.bot) return;

        const args = message.content.slice(Config.DiscordCommandPrefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);

        if (!command) return;

        try {
            command.execute(message, args);
        } catch (error) {
            console.error(`Error executing command ${commandName}:`, error);
            message.reply('There was an error executing that command.');
        }
    }
};
