const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('events')
    .setDescription('View RacingPoint events and competitions'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('RacingPoint Events')
      .setDescription(
        '**Monthly HotLap Challenge**\n' +
        'Compete for amazing prizes every month!\n\n' +
        '**Past Prizes:**\n' +
        '- iPhone\n' +
        '- PS5\n' +
        '- iPad\n' +
        '- Marshall Headphones\n\n' +
        '**Stay Updated:**\n' +
        'Follow [@racingpoint.esports](https://www.instagram.com/racingpoint.esports/) on Instagram for event announcements!\n\n' +
        '*Contact us for custom events, corporate team building, and college fests:* [+91 7981264279](https://wa.me/917981264279)'
      )
      .setFooter({ text: 'RacingPoint eSports and Cafe — Hyderabad' });

    await interaction.reply({ embeds: [embed] });
  },
};
