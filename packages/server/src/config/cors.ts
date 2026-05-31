import config from './config.constants';

/**
 * Socket.IO CORS origins.
 * - Development: allow all origins when CORS_ORIGINS is unset.
 * - Production: use CORS_ORIGINS (comma-separated); falls back to allow-all if unset.
 */
export function getSocketCorsOrigin(): string | string[] {
  const { CORS_ORIGINS, ENVIRONMENT } = config;

  if (CORS_ORIGINS.length > 0) {
    return CORS_ORIGINS;
  }

  if (ENVIRONMENT === 'development') {
    return '*';
  }

  return '*';
}
