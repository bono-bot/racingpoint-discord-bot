const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');

async function registerCommands(client) {
  const commandFiles = fs.readdirSync(__dirname)
    .filter(f => f.endsWith('.js') && f !== 'index.js');

  const commandData = [];

  for (const file of commandFiles) {
    const command = require(path.join(__dirname, file));
    client.commands.set(command.data.name, command);
    commandData.push(command.data.toJSON());
    logger.debug({ command: command.data.name }, 'Command loaded');
  }

  const rest = new REST({ version: '10' }).setToken(config.discord.token);

  try {
    await rest.put(
      Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
      { body: commandData }
    );
    logger.info({ count: commandData.length }, 'Slash commands registered');
  } catch (err) {
    logger.error({ err }, 'Failed to register slash commands');
  }
}

module.exports = { registerCommands };
