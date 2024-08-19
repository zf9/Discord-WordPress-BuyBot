const Discord = require('@discordjs/builders');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('ping')
        .setDescription('Ping Pong'),
    async execute(interaction) {
        return interaction.reply(`Pong!`);
    }
};
