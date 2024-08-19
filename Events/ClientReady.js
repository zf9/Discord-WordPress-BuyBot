const chalk = require('chalk');

module.exports = {
    execute(client) {
        console.log(chalk.cyan("Logged in as:"), chalk.cyanBright(client.user.tag));
    }
};
