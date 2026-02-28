const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout (mute) a member (Mod only)')
    .addUserOption(option =>
      option.setName('user').setDescription('The member to mute').setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('duration')
        .setDescription('Duration in minutes')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(10080) // 7 days max
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for muting').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = interaction.guild.members.cache.get(target.id);

    if (!member) {
      await interaction.reply({ content: 'User not found in this server.', ephemeral: true });
      return;
    }

    if (!member.moderatable) {
      await interaction.reply({ content: 'I cannot mute this user. They may have a higher role than me.', ephemeral: true });
      return;
    }

    const durationMs = duration * 60 * 1000;
    await member.timeout(durationMs, reason);
    await interaction.reply(`**${target.username}** has been muted for ${duration} minute${duration === 1 ? '' : 's'}. Reason: ${reason}`);
  },
};
