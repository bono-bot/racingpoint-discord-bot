const { Events } = require('discord.js');
const { handleMessage } = require('../services/messageHandler');
const { channels } = require('./ready');
const logger = require('../utils/logger');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    // Ignore bots
    if (message.author.bot) return;

    // Only respond in #ask-racing-point
    if (message.channel.id !== channels.askRacingPoint) return;

    // Ignore empty messages
    if (!message.content || message.content.trim().length === 0) return;

    logger.info({
      userId: message.author.id,
      username: message.author.username,
      text: message.content.substring(0, 50),
    }, 'Incoming message');

    handleMessage(message).catch(err => {
      logger.error({ err, userId: message.author.id }, 'Unhandled error in message handler');
    });
  },
};
