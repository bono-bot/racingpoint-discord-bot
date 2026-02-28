const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pricing')
    .setDescription('View RacingPoint gaming pricing'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('RacingPoint Gaming Pricing')
      .addFields(
        {
          name: 'Sim Racing (8 rigs)',
          value: [
            '**₹700** for 30 minutes',
            '**₹900** per hour per rig',
            '',
            '*Equipment:* Triple 32" 180Hz monitors, Conspit wheel base, pedals & seat',
            '*PC Specs:* AMD Ryzen 7 9700X, RTX 5070 Ti, 32GB RAM',
            '*Games:* Assetto Corsa, AC EVO, iRacing, F1 25, LeMans Ultimate, Forza Horizon 5, and more',
          ].join('\n'),
        },
        {
          name: 'PS5 Gaming (3 consoles)',
          value: [
            '**₹500** per hour',
            'Extra controller: **₹100**',
            '*Games:* FC 25 (FIFA), GTA, Call of Duty, Gran Turismo, and more',
          ].join('\n'),
        },
        {
          name: 'Sim Rig Rental',
          value: 'Available for external events, corporate team building, college fests.\nContact for custom pricing: +91 7981264279',
        }
      )
      .setFooter({ text: 'RacingPoint eSports and Cafe — Hyderabad' });

    await interaction.reply({ embeds: [embed] });
  },
};
