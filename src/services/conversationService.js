const { getDb } = require('../db/database');
const logger = require('../utils/logger');

const MAX_HISTORY = 20;

function getHistory(discordUserId) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT role, content FROM messages
    WHERE discord_user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(discordUserId, MAX_HISTORY);

  // Reverse to get chronological order
  return rows.reverse();
}

function saveMessage(discordUserId, role, content) {
  const db = getDb();
  db.prepare(`
    INSERT INTO messages (discord_user_id, role, content)
    VALUES (?, ?, ?)
  `).run(discordUserId, role, content);
}

function clearHistory(discordUserId) {
  const db = getDb();
  const result = db.prepare(`
    DELETE FROM messages WHERE discord_user_id = ?
  `).run(discordUserId);
  logger.info({ discordUserId, deleted: result.changes }, 'Conversation history cleared');
}

module.exports = { getHistory, saveMessage, clearHistory };
