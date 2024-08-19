const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const LoadCommands = (client) => {
    client.commands = new Map();
    const commandsPath = path.join(__dirname, '..', 'Commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        client.commands.set(command.name, command);
        console.log(chalk.magenta("[Loaded Command]:"), chalk.greenBright(file), "|", chalk.green(command.name));

    }
};


module.exports = LoadCommands;
