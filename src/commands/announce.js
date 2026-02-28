const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Create an event announcement (Admin only)')
    .addStringOption(option =>
      option.setName('title').setDescription('Event title').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('description').setDescription('Event description').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('date').setDescription('Event date and time').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('prize').setDescription('Prize details').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const date = interaction.options.getString('date');
    const prize = interaction.options.getString('prize');

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle(title)
      .setDescription(description)
      .addFields({ name: 'Date & Time', value: date })
      .setFooter({ text: 'RacingPoint eSports and Cafe — Hyderabad' })
      .setTimestamp();

    if (prize) {
      embed.addFields({ name: 'Prize', value: prize });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
