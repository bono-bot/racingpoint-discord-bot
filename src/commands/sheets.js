const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { sheets } = require('@racingpoint/google');
const { getGoogleAuth } = require('../services/googleAuth');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sheets')
    .setDescription('Manage Google Sheets')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('read')
        .setDescription('Read data from a spreadsheet')
        .addStringOption(opt =>
          opt.setName('spreadsheet').setDescription('Spreadsheet URL or ID').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('range').setDescription('Cell range (e.g. Sheet1!A1:D10)').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('write')
        .setDescription('Write data to a spreadsheet')
        .addStringOption(opt =>
          opt.setName('spreadsheet').setDescription('Spreadsheet URL or ID').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('range').setDescription('Cell range (e.g. Sheet1!A1)').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('values').setDescription('Comma-separated values for a single row').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('append')
        .setDescription('Append a row to a spreadsheet')
        .addStringOption(opt =>
          opt.setName('spreadsheet').setDescription('Spreadsheet URL or ID').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('range').setDescription('Sheet range (e.g. Sheet1!A:D)').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('values').setDescription('Comma-separated values for the new row').setRequired(true)
        )
    ),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const auth = getGoogleAuth();

    await interaction.deferReply({ ephemeral: true });

    try {
      const spreadsheetId = interaction.options.getString('spreadsheet');
      const range = interaction.options.getString('range');

      if (sub === 'read') {
        const data = await sheets.readRange({ auth, spreadsheetId, range });

        if (data.length === 0) {
          await interaction.editReply('No data found in that range.');
          return;
        }

        // Format as code block table
        const table = data.map(row => row.join(' | ')).join('\n');
        const display = table.length > 1900
          ? table.substring(0, 1900) + '\n...(truncated)'
          : table;

        await interaction.editReply(`\`\`\`\n${display}\n\`\`\``);

      } else if (sub === 'write' || sub === 'append') {
        const rawValues = interaction.options.getString('values');
        const values = [rawValues.split(',').map(v => v.trim())];

        const result = await sheets.writeRange({
          auth, spreadsheetId, range, values,
          append: sub === 'append',
        });

        await interaction.editReply(
          `${sub === 'append' ? 'Appended' : 'Written'}: ${result.updatedCells} cell(s) updated.`
        );
      }
    } catch (err) {
      await interaction.editReply(`Error: ${err.message}`);
    }
  },
};
