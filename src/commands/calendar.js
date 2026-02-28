const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { calendar } = require('@racingpoint/google');
const { getGoogleAuth } = require('../services/googleAuth');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('calendar')
    .setDescription('Manage Google Calendar')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('upcoming')
        .setDescription('List upcoming events')
        .addIntegerOption(opt =>
          opt.setName('count').setDescription('Number of events (default 5)').setMinValue(1).setMaxValue(20)
        )
    )
    .addSubcommand(sub =>
      sub.setName('create')
        .setDescription('Create a calendar event')
        .addStringOption(opt =>
          opt.setName('title').setDescription('Event title').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('start').setDescription('Start time (e.g. 2026-03-01T14:00:00)').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('end').setDescription('End time (e.g. 2026-03-01T16:00:00)').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('description').setDescription('Event description')
        )
        .addStringOption(opt =>
          opt.setName('location').setDescription('Event location')
        )
    )
    .addSubcommand(sub =>
      sub.setName('delete')
        .setDescription('Delete a calendar event')
        .addStringOption(opt =>
          opt.setName('id').setDescription('Event ID').setRequired(true)
        )
    ),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const auth = getGoogleAuth();

    await interaction.deferReply({ ephemeral: true });

    try {
      if (sub === 'upcoming') {
        const count = interaction.options.getInteger('count') || 5;
        const events = await calendar.listEvents({ auth, maxResults: count });

        if (events.length === 0) {
          await interaction.editReply('No upcoming events.');
          return;
        }

        const embed = new EmbedBuilder()
          .setColor(0xe74c3c)
          .setTitle(`Upcoming Events (${events.length})`)
          .setDescription(
            events.map((e, i) => {
              const start = new Date(e.start).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
              let line = `**${i + 1}. ${e.summary}**\n${start}`;
              if (e.location) line += `\nLocation: ${e.location}`;
              line += `\nID: \`${e.id}\``;
              return line;
            }).join('\n\n')
          )
          .setFooter({ text: 'Times shown in IST (Asia/Kolkata)' });

        await interaction.editReply({ embeds: [embed] });

      } else if (sub === 'create') {
        const title = interaction.options.getString('title');
        const start = interaction.options.getString('start');
        const end = interaction.options.getString('end');
        const description = interaction.options.getString('description');
        const location = interaction.options.getString('location');

        const event = await calendar.createEvent({
          auth, summary: title, start, end, description, location,
        });

        const embed = new EmbedBuilder()
          .setColor(0x2ecc71)
          .setTitle('Event Created')
          .addFields(
            { name: 'Title', value: event.summary },
            { name: 'Start', value: new Date(event.start).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) },
            { name: 'End', value: new Date(event.end).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) },
          )
          .setFooter({ text: `Event ID: ${event.id}` });

        if (event.htmlLink) {
          embed.setURL(event.htmlLink);
        }

        await interaction.editReply({ embeds: [embed] });

      } else if (sub === 'delete') {
        const eventId = interaction.options.getString('id');
        await calendar.deleteEvent({ auth, eventId });
        await interaction.editReply(`Event \`${eventId}\` deleted.`);
      }
    } catch (err) {
      await interaction.editReply(`Error: ${err.message}`);
    }
  },
};
