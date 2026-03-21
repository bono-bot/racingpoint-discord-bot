const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');
const { getBotLeaderboard, getActiveTimeTrial, getActiveTournaments } = require('./racecontrolService');

const STATE_FILE = path.join(__dirname, '../../data/record_state.json');
const RACING_RED = 0xe10600;
const FOOTER_TEXT = 'RacingPoint eSports and Cafe — Hyderabad';

// --- State helpers ---

function loadState() {
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (_err) {
    return {};
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// --- Embed helpers ---

/**
 * COMM-01: Post weekly leaderboard to #leaderboard channel.
 */
async function postWeeklyLeaderboard(client, channels) {
  const data = await getBotLeaderboard();
  const entries = data.entries || [];

  let description;
  if (entries.length === 0) {
    description = "No lap records yet. Get out there and set some times, Drivers!";
  } else {
    description = entries
      .slice(0, 10)
      .map((e, i) => `**${i + 1}.** ${e.driver} — ${e.time_formatted} on ${e.track} (${e.car})`)
      .join('\n');
  }

  const embed = new EmbedBuilder()
    .setColor(RACING_RED)
    .setTitle('Weekly Leaderboard — Top RacingPoint Drivers')
    .setDescription(description)
    .setFooter({ text: FOOTER_TEXT })
    .setTimestamp();

  if (!channels.leaderboard) {
    logger.warn('postWeeklyLeaderboard: no leaderboard channel ID');
    return;
  }

  const channel = client.channels.cache.get(channels.leaderboard);
  if (!channel) {
    logger.warn({ channelId: channels.leaderboard }, 'postWeeklyLeaderboard: channel not in cache');
    return;
  }

  await channel.send({ embeds: [embed] });
  logger.info('postWeeklyLeaderboard: sent');
}

/**
 * COMM-02: Check for new track records and announce them.
 */
async function checkTrackRecords(client, channels, state) {
  const data = await getBotLeaderboard();
  const entries = data.entries || [];

  for (const entry of entries) {
    const key = `${entry.track}|${entry.car}`;
    const prev = state[key];

    const isNewRecord = !prev || entry.time_ms < prev.best_lap_ms;

    if (isNewRecord) {
      const hadPrevious = Boolean(prev);
      state[key] = { best_lap_ms: entry.time_ms, driver: entry.driver };
      saveState(state);

      // Only announce if there was a previous record (skip first-time population)
      if (!hadPrevious) continue;

      if (!channels.leaderboard) {
        logger.warn('checkTrackRecords: no leaderboard channel ID');
        continue;
      }

      const channel = client.channels.cache.get(channels.leaderboard);
      if (!channel) {
        logger.warn({ channelId: channels.leaderboard }, 'checkTrackRecords: channel not in cache');
        continue;
      }

      const embed = new EmbedBuilder()
        .setColor(RACING_RED)
        .setTitle('New Track Record!')
        .setDescription(
          `**${entry.driver}** just set a new track record!\n\nTrack: **${entry.track}**\nCar: **${entry.car}**\nTime: **${entry.time_formatted}**`
        )
        .setFooter({ text: FOOTER_TEXT })
        .setTimestamp();

      await channel.send({ embeds: [embed] });
      logger.info({ track: entry.track, car: entry.car, driver: entry.driver, time_ms: entry.time_ms }, 'New track record announced');
    }
  }
}

/**
 * COMM-04 part 1: Post weekly time trial challenge.
 */
async function postWeeklyTimeTrial(client, channels) {
  const data = await getActiveTimeTrial();
  const tt = data.time_trial;

  let embed;
  if (!tt) {
    embed = new EmbedBuilder()
      .setColor(RACING_RED)
      .setTitle('Weekly Time Trial Challenge')
      .setDescription('No time trial this week — stay tuned, Drivers!')
      .setFooter({ text: FOOTER_TEXT })
      .setTimestamp();
  } else {
    embed = new EmbedBuilder()
      .setColor(RACING_RED)
      .setTitle('Weekly Time Trial Challenge')
      .setDescription(
        `**Track:** ${tt.track}\n**Car:** ${tt.car}\n**Start:** ${tt.start_date}\n**End:** ${tt.end_date}`
      )
      .addFields({
        name: '\u200b',
        value: 'Think you can top the board? Head to RacingPoint and give it your best shot!',
      })
      .setFooter({ text: FOOTER_TEXT })
      .setTimestamp();
  }

  if (!channels.leaderboard) {
    logger.warn('postWeeklyTimeTrial: no leaderboard channel ID');
    return;
  }

  const channel = client.channels.cache.get(channels.leaderboard);
  if (!channel) {
    logger.warn({ channelId: channels.leaderboard }, 'postWeeklyTimeTrial: channel not in cache');
    return;
  }

  await channel.send({ embeds: [embed] });
  logger.info('postWeeklyTimeTrial: sent');
}

/**
 * COMM-04 part 2: Post active tournament updates.
 */
async function postTournamentUpdates(client, channels) {
  const tournaments = await getActiveTournaments();

  if (!tournaments || tournaments.length === 0) {
    // Do not post when no active tournaments
    return;
  }

  const description = tournaments
    .map(t => `**${t.name}** — ${t.status}`)
    .join('\n');

  const embed = new EmbedBuilder()
    .setColor(RACING_RED)
    .setTitle('Active Tournaments')
    .setDescription(description)
    .setFooter({ text: FOOTER_TEXT })
    .setTimestamp();

  if (!channels.leaderboard) {
    logger.warn('postTournamentUpdates: no leaderboard channel ID');
    return;
  }

  const channel = client.channels.cache.get(channels.leaderboard);
  if (!channel) {
    logger.warn({ channelId: channels.leaderboard }, 'postTournamentUpdates: channel not in cache');
    return;
  }

  await channel.send({ embeds: [embed] });
  logger.info({ count: tournaments.length }, 'postTournamentUpdates: sent');
}

// --- Scheduler entry point ---

function startScheduler(client, channels) {
  const state = loadState();

  // Mon 09:00 IST — weekly leaderboard summary (COMM-01)
  cron.schedule('0 9 * * 1', async () => {
    try {
      await postWeeklyLeaderboard(client, channels);
    } catch (err) {
      logger.error({ err }, 'Cron: postWeeklyLeaderboard failed');
    }
  }, { timezone: 'Asia/Kolkata' });

  // Every 15 min — track record polling (COMM-02)
  cron.schedule('*/15 * * * *', async () => {
    try {
      await checkTrackRecords(client, channels, state);
    } catch (err) {
      logger.error({ err }, 'Cron: checkTrackRecords failed');
    }
  }, { timezone: 'Asia/Kolkata' });

  // Mon 09:05 IST — weekly time trial + tournament updates (COMM-04)
  cron.schedule('5 9 * * 1', async () => {
    try {
      await postWeeklyTimeTrial(client, channels);
      await postTournamentUpdates(client, channels);
    } catch (err) {
      logger.error({ err }, 'Cron: postWeeklyTimeTrial/postTournamentUpdates failed');
    }
  }, { timezone: 'Asia/Kolkata' });

  logger.info('Scheduler started: 3 cron tasks active');
}

module.exports = { startScheduler };
