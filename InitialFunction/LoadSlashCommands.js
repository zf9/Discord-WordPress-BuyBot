const fs = require('fs');
const path = require('path');
const chalk = require('chalk');


const LoadSlashCommands = (client) => {
    client.slashCommands = new Map();
    const slashCommandsPath = path.join(__dirname, '..', 'SlashCommands');
    const slashCommandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));

    for (const file of slashCommandFiles) {
        const slashCommand = require(path.join(slashCommandsPath, file));
        client.slashCommands.set(slashCommand.data.name, slashCommand);
        console.log(chalk.magenta("[Loaded Slash Command]:"), chalk.greenBright(file), "|", chalk.greenBright(slashCommand.data.name));
    }
};

module.exports = LoadSlashCommands;
