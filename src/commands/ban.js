const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server (Mod only)')
    .addUserOption(option =>
      option.setName('user').setDescription('The member to ban').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for banning').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = interaction.guild.members.cache.get(target.id);

    if (member && !member.bannable) {
      await interaction.reply({ content: 'I cannot ban this user. They may have a higher role than me.', ephemeral: true });
      return;
    }

    await interaction.guild.members.ban(target.id, { reason });
    await interaction.reply(`**${target.username}** has been banned. Reason: ${reason}`);
  },
};
