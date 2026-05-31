/**
 * Socket.IO server URL.
 * - Dev: localhost backend unless VITE_API_URL is set.
 * - Production: VITE_API_URL (required for Vercel + separate API host).
 * - Fallback: same origin (single-host deploy / vite preview).
 */
export function getSocketUrl(): string {
	const configured = import.meta.env.VITE_API_URL?.trim();
	if (configured) {
		return configured.replace(/\/$/, '');
	}

	if (import.meta.env.DEV) {
		return 'http://localhost:3000';
	}

	return window.location.origin;
}
