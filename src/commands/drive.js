const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { drive } = require('@racingpoint/google');
const { getGoogleAuth } = require('../services/googleAuth');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('drive')
    .setDescription('Manage Google Drive')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List files in Google Drive')
        .addStringOption(opt =>
          opt.setName('folder').setDescription('Folder ID to list (optional)')
        )
        .addIntegerOption(opt =>
          opt.setName('count').setDescription('Number of files (default 10)').setMinValue(1).setMaxValue(25)
        )
    )
    .addSubcommand(sub =>
      sub.setName('upload')
        .setDescription('Upload a file to Google Drive')
        .addAttachmentOption(opt =>
          opt.setName('file').setDescription('File to upload').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('folder').setDescription('Destination folder ID (optional)')
        )
    )
    .addSubcommand(sub =>
      sub.setName('share')
        .setDescription('Get a shareable link for a file')
        .addStringOption(opt =>
          opt.setName('id').setDescription('File ID').setRequired(true)
        )
    ),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const auth = getGoogleAuth();

    await interaction.deferReply({ ephemeral: true });

    try {
      if (sub === 'list') {
        const folderId = interaction.options.getString('folder');
        const count = interaction.options.getInteger('count') || 10;

        const files = await drive.listFiles({ auth, folderId, maxResults: count });

        if (files.length === 0) {
          await interaction.editReply('No files found.');
          return;
        }

        const embed = new EmbedBuilder()
          .setColor(0xe74c3c)
          .setTitle(`Google Drive (${files.length} files)`)
          .setDescription(
            files.map((f, i) => {
              const size = f.size ? `${(parseInt(f.size) / 1024).toFixed(1)}KB` : 'N/A';
              return `**${i + 1}.** [${f.name}](${f.webViewLink})\nType: ${f.mimeType} | Size: ${size}\nID: \`${f.id}\``;
            }).join('\n\n')
          );

        await interaction.editReply({ embeds: [embed] });

      } else if (sub === 'upload') {
        const attachment = interaction.options.getAttachment('file');
        const folderId = interaction.options.getString('folder');

        // Download the attachment
        const response = await fetch(attachment.url);
        const buffer = Buffer.from(await response.arrayBuffer());

        const result = await drive.uploadFile({
          auth,
          name: attachment.name,
          mimeType: attachment.contentType || 'application/octet-stream',
          body: buffer,
          folderId,
        });

        await interaction.editReply(
          `File uploaded: **${result.name}**\nID: \`${result.id}\`\nLink: ${result.webViewLink || 'Use /drive share to get a link'}`
        );

      } else if (sub === 'share') {
        const fileId = interaction.options.getString('id');
        const link = await drive.getShareableLink({ auth, fileId });
        await interaction.editReply(`Shareable link: ${link}`);
      }
    } catch (err) {
      await interaction.editReply(`Error: ${err.message}`);
    }
  },
};
