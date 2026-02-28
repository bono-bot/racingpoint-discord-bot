const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hours')
    .setDescription('View RacingPoint opening hours'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('RacingPoint Hours')
      .addFields(
        {
          name: 'Gaming Arena',
          value: '12:00 PM – 12:00 AM (midnight), every day\n*Can extend to 3:00 AM — call before 11:00 PM to request late hours*',
        },
        {
          name: 'Cafe',
          value: '12:00 PM – 10:00 PM, every day',
        },
        {
          name: 'Holidays',
          value: 'Open all days including holidays!',
        }
      )
      .setFooter({ text: 'RacingPoint eSports and Cafe — Hyderabad' });

    await interaction.reply({ embeds: [embed] });
  },
};
