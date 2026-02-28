const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('book')
    .setDescription('Book a sim racing or PS5 session at RacingPoint'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('Book a Session at RacingPoint')
      .setDescription(
        'Ready to race? Book your session right here!\n\n' +
        '**Sim Racing** — ₹700/30min | ₹900/hour\n' +
        '**PS5 Gaming** — ₹500/hour\n\n' +
        '**Hours:** 12:00 PM – 12:00 AM (midnight), every day\n\n' +
        'Click the button below to book your slot!'
      )
      .setFooter({ text: 'RacingPoint eSports and Cafe — Hyderabad' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('booking_start')
          .setLabel('Book Now')
          .setStyle(ButtonStyle.Danger),
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
