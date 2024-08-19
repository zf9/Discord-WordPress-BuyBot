module.exports = {
    name: 'ping',
    description: 'Ping Pong',

    execute(message, args) {
        return message.reply('Pong!');
    }
};
