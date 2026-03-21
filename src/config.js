require('dotenv').config();

module.exports = {
  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
  },
  claude: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
  racecontrol: {
    apiUrl: process.env.RC_API_URL || 'https://app.racingpoint.cloud/api/v1',
    terminalSecret: process.env.RC_TERMINAL_SECRET,
  },
  logLevel: process.env.LOG_LEVEL || 'info',
};
