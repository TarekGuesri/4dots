import { io } from 'socket.io-client';

import { getSocketUrl } from '@src/config/env';

const socketUrl = getSocketUrl();

console.log('Initializing socket connection to:', socketUrl);

export const socket = io(socketUrl, {
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
