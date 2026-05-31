const GAME_STATS_TOKEN_KEY = '4dots:game-stats-token';

/**
 * Returns the encrypted game stats token previously issued by the server, or
 * null if there isn't one (first visit or storage unavailable).
 */
export function getStoredGameStatsToken(): string | null {
	try {
		return localStorage.getItem(GAME_STATS_TOKEN_KEY);
	} catch {
		return null;
	}
}

/** Persists the encrypted game stats token issued by the server. */
export function setStoredGameStatsToken(token: string): void {
	try {
		localStorage.setItem(GAME_STATS_TOKEN_KEY, token);
	} catch {
		// Ignore storage errors (e.g. private mode / disabled storage).
	}
}
