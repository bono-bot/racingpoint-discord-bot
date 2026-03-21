const config = require('../config');
const logger = require('../utils/logger');

const RC_API_URL = config.racecontrol.apiUrl;
const RC_SECRET = config.racecontrol.terminalSecret;

const HEADERS = {
  'Content-Type': 'application/json',
  'x-terminal-secret': RC_SECRET,
};

/**
 * Fetch the bot leaderboard from RaceControl.
 * Returns top lap records for weekly summary and record tracking.
 * @returns {{ entries: Array, count: number }}
 */
async function getBotLeaderboard() {
  try {
    const url = `${RC_API_URL}/bot/leaderboard`;
    const res = await fetch(url, { headers: HEADERS });
    const data = await res.json();
    return data;
  } catch (err) {
    logger.error({ err }, 'RC getBotLeaderboard failed');
    return { entries: [], count: 0 };
  }
}

/**
 * Fetch the active time trial from RaceControl (public endpoint, no auth needed).
 * @returns {{ time_trial: object | null, message?: string }}
 */
async function getActiveTimeTrial() {
  try {
    const url = `${RC_API_URL}/public/time-trial`;
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) {
    logger.error({ err }, 'RC getActiveTimeTrial failed');
    return { time_trial: null };
  }
}

/**
 * Fetch active and registering tournaments from RaceControl.
 * Filters to only tournaments with status 'active' or 'registering'.
 * @returns {Array}
 */
async function getActiveTournaments() {
  try {
    const url = `${RC_API_URL}/tournaments`;
    const res = await fetch(url, { headers: HEADERS });
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.tournaments || []);
    return list.filter(t => t.status === 'active' || t.status === 'registering');
  } catch (err) {
    logger.error({ err }, 'RC getActiveTournaments failed');
    return [];
  }
}

module.exports = { getBotLeaderboard, getActiveTimeTrial, getActiveTournaments };
