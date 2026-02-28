const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { gmail } = require('@racingpoint/google');
const { getGoogleAuth } = require('../services/googleAuth');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gmail')
    .setDescription('Manage Gmail for bono@racingpoint.in')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('inbox')
        .setDescription('List recent inbox emails')
        .addIntegerOption(opt =>
          opt.setName('count').setDescription('Number of emails (default 5)').setMinValue(1).setMaxValue(20)
        )
    )
    .addSubcommand(sub =>
      sub.setName('read')
        .setDescription('Read a specific email by ID')
        .addStringOption(opt =>
          opt.setName('id').setDescription('Email message ID').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('send')
        .setDescription('Send an email')
        .addStringOption(opt =>
          opt.setName('to').setDescription('Recipient email').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('subject').setDescription('Email subject').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('body').setDescription('Email body').setRequired(true)
        )
    ),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const auth = getGoogleAuth();

    await interaction.deferReply({ ephemeral: true });

    try {
      if (sub === 'inbox') {
        const count = interaction.options.getInteger('count') || 5;
        const emails = await gmail.listInbox({ auth, maxResults: count });

        if (emails.length === 0) {
          await interaction.editReply('No emails found.');
          return;
        }

        const embed = new EmbedBuilder()
          .setColor(0xe74c3c)
          .setTitle(`Inbox (${emails.length} emails)`)
          .setDescription(
            emails.map((e, i) =>
              `**${i + 1}.** ${e.subject || '(No subject)'}\nFrom: ${e.from}\nID: \`${e.id}\``
            ).join('\n\n')
          )
          .setFooter({ text: 'Use /gmail read <id> to read a specific email' });

        await interaction.editReply({ embeds: [embed] });

      } else if (sub === 'read') {
        const messageId = interaction.options.getString('id');
        const email = await gmail.readEmail({ auth, messageId });

        const bodyPreview = email.body.length > 1800
          ? email.body.substring(0, 1800) + '...'
          : email.body;

        const embed = new EmbedBuilder()
          .setColor(0xe74c3c)
          .setTitle(email.subject || '(No subject)')
          .addFields(
            { name: 'From', value: email.from || 'Unknown', inline: true },
            { name: 'To', value: email.to || 'Unknown', inline: true },
            { name: 'Date', value: email.date || 'Unknown' },
            { name: 'Body', value: bodyPreview || '(Empty)' },
          );

        await interaction.editReply({ embeds: [embed] });

      } else if (sub === 'send') {
        const to = interaction.options.getString('to');
        const subject = interaction.options.getString('subject');
        const body = interaction.options.getString('body');

        const result = await gmail.sendEmail({ auth, to, subject, body });

        await interaction.editReply(`Email sent to **${to}**! Message ID: \`${result.id}\``);
      }
    } catch (err) {
      await interaction.editReply(`Error: ${err.message}`);
    }
  },
};
