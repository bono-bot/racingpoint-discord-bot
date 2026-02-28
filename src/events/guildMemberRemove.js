const { Events } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member) {
    logger.info({
      userId: member.id,
      username: member.user.username,
      guild: member.guild.name,
    }, 'Member left the server');
  },
};
