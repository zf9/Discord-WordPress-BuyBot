const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const Discord = require('discord.js');

const LoadEvents = (client) => {
    const eventsPath = path.join(__dirname, '..', 'Events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const eventName = path.basename(file, '.js');
        const eventPath = path.join(eventsPath, file);

        try {
            const event = require(eventPath);
            if (typeof event.execute !== 'function') {
                console.warn(chalk.yellowBright(`Skipping invalid event file: ${file}. No execute function found.`));
                continue;
            }

            if (Discord.Events[eventName]) {
                client.on(Discord.Events[eventName], (...args) => event.execute(...args, client));
                console.log(chalk.magenta("[Loaded Event]:"), chalk.greenBright(file));
            } else {
                console.warn(chalk.yellowBright(`Skipping unknown event name: ${eventName} in file ${file}.`));
            }
        } catch (error) {
            console.error(chalk.red(`Error loading event ${file}:`), chalk.redBright(error));
        }
    }
};

module.exports = LoadEvents; // Recoded & Optimized By ChatGPT - Added Better Error Checking
