import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL =
	process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000';

console.log(
	'Initializing socket connection to:',
	URL ?? 'http://localhost:3000',
);

export const socket = io(URL ?? '', {
	// Reconnection settings
	reconnection: true,
	reconnectionAttempts: 5,
	reconnectionDelay: 1000,
	reconnectionDelayMax: 5000,
	timeout: 20000,

	// Transport settings
	transports: ['websocket', 'polling'],

	// Auto-reconnect on disconnect
	autoConnect: true,

	// Force new connection on reconnection
	forceNew: false,
});

// Add connection event listeners for debugging
socket.on('connect', () => {
	console.log('Socket connected successfully, ID:', socket.id);
});

socket.on('connect_error', (error) => {
	console.error('Socket connection error:', error);
});

socket.on('disconnect', (reason) => {
	console.log('Socket disconnected, reason:', reason);
});
