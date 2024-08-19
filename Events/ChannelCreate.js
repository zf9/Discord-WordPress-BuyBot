const Discord = require("discord.js");
const chalk = require('chalk');
const ChannelCreateConfig = require('../Config/ChannelCreate.json')

module.exports = {
    async execute(channel) {
        if (channel.parentId === ChannelCreateConfig.parentId){
            const row = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('buy_yes')
                    .setLabel('YES')
                    .setStyle(Discord.ButtonStyle.Primary),
                new Discord.ButtonBuilder()
                    .setCustomId('buy_no')
                    .setLabel('NO')
                    .setStyle(Discord.ButtonStyle.Danger),
            );
            
            await channel.send({
                content: "Hello, it looks like you've created a Ticket. Would you like to purchase a product today?",
                components: [row]
            });
        }
    }
};
