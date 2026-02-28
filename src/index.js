const config = require('./config');
const client = require('./bot');
const { close: closeDb } = require('./db/database');
const logger = require('./utils/logger');

client.login(config.discord.token);

// Graceful shutdown
function shutdown(signal) {
  logger.info({ signal }, 'Shutting down...');
  client.destroy();
  closeDb();
  logger.info('Bot shut down');
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
