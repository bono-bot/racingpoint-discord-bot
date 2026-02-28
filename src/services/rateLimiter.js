const logger = require('../utils/logger');

// Simple in-memory rate limiter: max messages per window per user
const MAX_MESSAGES = 20;
const WINDOW_MS = 60 * 1000; // 1 minute

const userBuckets = new Map();

function isRateLimited(userId) {
  const now = Date.now();
  let bucket = userBuckets.get(userId);

  if (!bucket || now - bucket.windowStart > WINDOW_MS) {
    bucket = { windowStart: now, count: 0 };
    userBuckets.set(userId, bucket);
  }

  bucket.count++;

  if (bucket.count > MAX_MESSAGES) {
    logger.warn({ userId, count: bucket.count }, 'Rate limited');
    return true;
  }

  return false;
}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, bucket] of userBuckets) {
    if (now - bucket.windowStart > WINDOW_MS * 2) {
      userBuckets.delete(id);
    }
  }
}, 5 * 60 * 1000).unref();

module.exports = { isRateLimited };
