const ollamaService = require('./ollamaService');
const conversationService = require('./conversationService');
const rateLimiter = require('./rateLimiter');
const { buildSystemPrompt } = require('../prompts/systemPrompt');
const { enqueue } = require('../utils/queueManager');
const logger = require('../utils/logger');

const DISCORD_MAX_LENGTH = 2000;

function splitMessage(text) {
  if (text.length <= DISCORD_MAX_LENGTH) return [text];

  const chunks = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= DISCORD_MAX_LENGTH) {
      chunks.push(remaining);
      break;
    }

    // Try to split at a newline
    let splitIndex = remaining.lastIndexOf('\n', DISCORD_MAX_LENGTH);
    if (splitIndex === -1 || splitIndex < DISCORD_MAX_LENGTH / 2) {
      // Try to split at a space
      splitIndex = remaining.lastIndexOf(' ', DISCORD_MAX_LENGTH);
    }
    if (splitIndex === -1 || splitIndex < DISCORD_MAX_LENGTH / 2) {
      splitIndex = DISCORD_MAX_LENGTH;
    }

    chunks.push(remaining.slice(0, splitIndex));
    remaining = remaining.slice(splitIndex).trimStart();
  }

  return chunks;
}

async function handleMessage(message) {
  const userId = message.author.id;
  const text = message.content.trim();
  const username = message.author.username;

  // Rate limit check
  if (rateLimiter.isRateLimited(userId)) {
    await message.reply('You\'re sending messages too fast. Please wait a moment and try again.');
    return;
  }

  // Queue per user to serialize messages
  await enqueue(userId, () => processMessage(message, userId, text, username));
}

async function processMessage(message, userId, text, username) {
  try {
    // Handle "reset" command
    if (text.toLowerCase() === 'reset') {
      conversationService.clearHistory(userId);
      await message.reply('Conversation cleared! How can I help you?');
      return;
    }

    // Show typing indicator
    await message.channel.sendTyping();

    // Load conversation history
    const history = conversationService.getHistory(userId);

    // Build messages array for Ollama
    const messages = [
      { role: 'system', content: buildSystemPrompt() },
      ...history.map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: text },
    ];

    // Get AI response
    const reply = await ollamaService.chat(messages);

    // Save to history
    conversationService.saveMessage(userId, 'user', text);
    conversationService.saveMessage(userId, 'assistant', reply);

    // Split and send response (Discord 2000 char limit)
    const chunks = splitMessage(reply);
    for (let i = 0; i < chunks.length; i++) {
      if (i === 0) {
        await message.reply(chunks[i]);
      } else {
        await message.channel.send(chunks[i]);
      }
    }

    logger.info({ userId, username, textLength: text.length, replyLength: reply.length }, 'Message handled');
  } catch (err) {
    logger.error({ err, userId }, 'Failed to process message');

    try {
      await message.reply(
        'Sorry, I\'m having a bit of trouble right now. Please try again in a moment, or contact us directly on WhatsApp: https://wa.me/917981264279'
      );
    } catch (sendErr) {
      logger.error({ err: sendErr, userId }, 'Failed to send error message');
    }
  }
}

module.exports = { handleMessage };
