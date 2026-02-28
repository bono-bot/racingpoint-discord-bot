const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const bookingService = require('../services/bookingService');
const logger = require('../utils/logger');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        logger.warn({ commandName: interaction.commandName }, 'Unknown command');
        await interaction.reply({ content: 'Unknown command.', ephemeral: true });
        return;
      }

      try {
        await command.execute(interaction);
        logger.info({
          commandName: interaction.commandName,
          userId: interaction.user.id,
          username: interaction.user.username,
        }, 'Command executed');
      } catch (err) {
        logger.error({ err, commandName: interaction.commandName }, 'Command execution failed');

        const reply = { content: 'There was an error executing this command.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      }
      return;
    }

    // Handle button clicks
    if (interaction.isButton()) {
      if (interaction.customId === 'booking_start') {
        await handleBookingButton(interaction);
      }
      return;
    }

    // Handle modal submissions
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'booking_modal') {
        await handleBookingModal(interaction);
      }
      return;
    }
  },
};

async function handleBookingButton(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('booking_modal')
    .setTitle('Book a Session');

  const dateInput = new TextInputBuilder()
    .setCustomId('booking_date')
    .setLabel('Date (YYYY-MM-DD, e.g. 2026-03-05)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('2026-03-05')
    .setRequired(true)
    .setMinLength(10)
    .setMaxLength(10);

  const timeInput = new TextInputBuilder()
    .setCustomId('booking_time')
    .setLabel('Start Time (HH:MM 24hr, e.g. 14:00 for 2 PM)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('14:00')
    .setRequired(true)
    .setMinLength(5)
    .setMaxLength(5);

  const nameInput = new TextInputBuilder()
    .setCustomId('booking_name')
    .setLabel('Your Full Name')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('John Doe')
    .setRequired(true)
    .setMaxLength(100);

  const phoneInput = new TextInputBuilder()
    .setCustomId('booking_phone')
    .setLabel('Phone Number (10 digits)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('9876543210')
    .setRequired(true)
    .setMinLength(10)
    .setMaxLength(15);

  const emailInput = new TextInputBuilder()
    .setCustomId('booking_email')
    .setLabel('Email (optional)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('you@example.com')
    .setRequired(false)
    .setMaxLength(100);

  modal.addComponents(
    new ActionRowBuilder().addComponents(dateInput),
    new ActionRowBuilder().addComponents(timeInput),
    new ActionRowBuilder().addComponents(nameInput),
    new ActionRowBuilder().addComponents(phoneInput),
    new ActionRowBuilder().addComponents(emailInput),
  );

  await interaction.showModal(modal);
}

async function handleBookingModal(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const date = interaction.fields.getTextInputValue('booking_date').trim();
    const time = interaction.fields.getTextInputValue('booking_time').trim();
    const name = interaction.fields.getTextInputValue('booking_name').trim();
    const phone = interaction.fields.getTextInputValue('booking_phone').trim();
    const email = interaction.fields.getTextInputValue('booking_email')?.trim() || null;

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      await interaction.editReply('Invalid date format. Please use YYYY-MM-DD (e.g. 2026-03-05).');
      return;
    }

    // Validate time format
    if (!/^\d{2}:\d{2}$/.test(time)) {
      await interaction.editReply('Invalid time format. Please use HH:MM in 24-hour format (e.g. 14:00).');
      return;
    }

    // Validate date is not in the past
    const bookingDate = new Date(`${date}T${time}:00+05:30`);
    if (bookingDate < new Date()) {
      await interaction.editReply('The booking date/time cannot be in the past. Please try again.');
      return;
    }

    // Validate phone number
    if (!/^\d{10,15}$/.test(phone.replace(/[\s\-+]/g, ''))) {
      await interaction.editReply('Invalid phone number. Please enter a valid 10-digit phone number.');
      return;
    }

    // Calculate end time (default 1 hour session)
    const [hours, minutes] = time.split(':').map(Number);
    const endHours = hours + 1;
    const endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    const result = await bookingService.createBooking({
      discordUserId: interaction.user.id,
      name,
      phone,
      email,
      bookingType: 'Sim Racing',
      date,
      startTime: time,
      endTime,
    });

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('Booking Confirmed!')
      .setDescription('Your session has been booked! A calendar invite has been sent to the RacingPoint team.')
      .addFields(
        { name: 'Booking ID', value: `\`${result.bookingId}\``, inline: true },
        { name: 'Type', value: 'Sim Racing', inline: true },
        { name: 'Date', value: date, inline: true },
        { name: 'Time', value: `${time} - ${endTime}`, inline: true },
        { name: 'Name', value: name, inline: true },
        { name: 'Phone', value: phone, inline: true },
      )
      .setFooter({ text: 'For changes, contact +91 7981264279 | RacingPoint eSports and Cafe' });

    await interaction.editReply({ embeds: [embed] });
    logger.info({ bookingId: result.bookingId, userId: interaction.user.id, name }, 'Discord booking created');
  } catch (err) {
    logger.error({ err, userId: interaction.user.id }, 'Failed to create booking via Discord modal');
    await interaction.editReply('Sorry, there was an error creating your booking. Please try again or contact us on WhatsApp: https://wa.me/917981264279');
  }
}
