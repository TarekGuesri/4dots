import { config } from 'dotenv';

config();

export default {
  PORT: parseInt(process.env.PORT) || 3001,
  ENVIRONMENT: process.env.ENVIRONMENT,
  GAME_STATS_SECRET:
    process.env.GAME_STATS_SECRET || 'dev-only-insecure-game-stats-secret',
};
