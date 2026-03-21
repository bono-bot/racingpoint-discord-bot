const { Events, ChannelType, PermissionFlagsBits } = require('discord.js');
const { registerCommands } = require('../commands');
const logger = require('../utils/logger');
const config = require('../config');

// Store channel IDs for use by other modules
const channels = {
  askRacingPoint: null,
  welcome: null,
  leaderboard: null,
};

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    logger.info({ tag: client.user.tag }, 'Bot is online');

    // Register slash commands
    await registerCommands(client);

    // Auto-create channels
    const guild = client.guilds.cache.get(config.discord.guildId);
    if (!guild) {
      logger.error({ guildId: config.discord.guildId }, 'Guild not found');
      return;
    }

    // Find or create #ask-racing-point
    let askChannel = guild.channels.cache.find(
      ch => ch.name === 'ask-racing-point' && ch.type === ChannelType.GuildText
    );
    if (!askChannel) {
      try {
        askChannel = await guild.channels.create({
          name: 'ask-racing-point',
          type: ChannelType.GuildText,
          topic: 'Chat with the Racing Point Bot! Ask about hours, pricing, menu, events, and more.',
        });
        logger.info({ channelId: askChannel.id }, '#ask-racing-point channel created');
      } catch (err) {
        logger.error({ err }, 'Failed to create #ask-racing-point channel');
      }
    }
    channels.askRacingPoint = askChannel?.id || null;

    // Find or create #welcome
    let welcomeChannel = guild.channels.cache.find(
      ch => ch.name === 'welcome' && ch.type === ChannelType.GuildText
    );
    if (!welcomeChannel) {
      try {
        welcomeChannel = await guild.channels.create({
          name: 'welcome',
          type: ChannelType.GuildText,
          topic: 'Welcome new members to Racing Point!',
        });
        logger.info({ channelId: welcomeChannel.id }, '#welcome channel created');
      } catch (err) {
        logger.error({ err }, 'Failed to create #welcome channel');
      }
    }
    channels.welcome = welcomeChannel?.id || null;

    // Find or create #leaderboard
    let leaderboardChannel = guild.channels.cache.find(
      ch => ch.name === 'leaderboard' && ch.type === ChannelType.GuildText
    );
    if (!leaderboardChannel) {
      try {
        leaderboardChannel = await guild.channels.create({
          name: 'leaderboard',
          type: ChannelType.GuildText,
          topic: 'Weekly leaderboard summaries, track records, and time trial challenges.',
        });
        logger.info({ channelId: leaderboardChannel.id }, '#leaderboard channel created');
      } catch (err) {
        logger.error({ err }, 'Failed to create #leaderboard channel');
      }
    }
    channels.leaderboard = leaderboardChannel?.id || null;

    logger.info({
      askRacingPoint: channels.askRacingPoint,
      welcome: channels.welcome,
      leaderboard: channels.leaderboard,
    }, 'Channel IDs resolved');

    const { startScheduler } = require('../services/scheduler');
    startScheduler(client, channels);
  },
};

module.exports.channels = channels;
