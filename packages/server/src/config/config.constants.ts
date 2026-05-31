import { config } from 'dotenv';

config();

function parseCorsOrigins(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export default {
  PORT: parseInt(process.env.PORT ?? '', 10) || 3000,
  ENVIRONMENT: process.env.ENVIRONMENT ?? 'development',
  CORS_ORIGINS: parseCorsOrigins(process.env.CORS_ORIGINS),
  GAME_STATS_SECRET:
    process.env.GAME_STATS_SECRET || 'dev-only-insecure-game-stats-secret',
};
