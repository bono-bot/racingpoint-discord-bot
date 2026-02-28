require('dotenv').config();

module.exports = {
  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
  },
  ollama: {
    url: process.env.OLLAMA_URL || 'http://localhost:32769',
    model: process.env.OLLAMA_MODEL || 'llama3.1:8b',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
  logLevel: process.env.LOG_LEVEL || 'info',
};
