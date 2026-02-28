const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server (Mod only)')
    .addUserOption(option =>
      option.setName('user').setDescription('The member to kick').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for kicking').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = interaction.guild.members.cache.get(target.id);

    if (!member) {
      await interaction.reply({ content: 'User not found in this server.', ephemeral: true });
      return;
    }

    if (!member.kickable) {
      await interaction.reply({ content: 'I cannot kick this user. They may have a higher role than me.', ephemeral: true });
      return;
    }

    await member.kick(reason);
    await interaction.reply(`**${target.username}** has been kicked. Reason: ${reason}`);
  },
};
