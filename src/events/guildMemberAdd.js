const { Events, EmbedBuilder } = require('discord.js');
const { channels } = require('./ready');
const logger = require('../utils/logger');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const welcomeChannelId = channels.welcome;
    if (!welcomeChannelId) return;

    const channel = member.guild.channels.cache.get(welcomeChannelId);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('Welcome to Racing Point!')
      .setDescription(
        `Hey ${member}, welcome to **RacingPoint eSports and Cafe**! We're glad to have you here.\n\n` +
        `**What we offer:**\n` +
        `- 8 professional sim racing rigs\n` +
        `- 3 PS5 gaming consoles\n` +
        `- Full cafe with food & drinks\n` +
        `- Monthly HotLap Challenge events with amazing prizes\n\n` +
        `Head over to <#${channels.askRacingPoint}> to chat with our bot and learn more about hours, pricing, menu, and events!`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'RacingPoint eSports and Cafe — Hyderabad' })
      .setTimestamp();

    try {
      await channel.send({ embeds: [embed] });
      logger.info({ userId: member.id, username: member.user.username }, 'Welcome message sent');
    } catch (err) {
      logger.error({ err, userId: member.id }, 'Failed to send welcome message');
    }
  },
};
