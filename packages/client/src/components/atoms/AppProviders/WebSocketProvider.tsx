import { useAtom, useAtomValue } from 'jotai';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

import { useGameStatsSync } from '@hooks/useGameStatsSync';
import { useGameWebSocket } from '@hooks/useGameWebSocket';
import { useRoomWebSocket } from '@hooks/useRoomWebSocket';
import { socket } from '@src/socket';
import { RoomInfoAtom } from '@state/room';
import { SocketUserIdAtom } from '@state/socket';
import { SoundAtom } from '@state/ui';

import type {
	BoardDisksType,
	CurrentPlayerType,
	GameResultType,
} from '@4dots/shared';
import type { ReactNode } from 'react';

interface WebSocketContextType {
	createRoom: () => void;
	joinRoom: (roomId: string) => void;
	leaveRoom: () => void;
	startGame: () => void;
	makeMove: (params: {
		newBoard: BoardDisksType;
		currentPlayer: CurrentPlayerType;
		winner: CurrentPlayerType | null;
	}) => void;
	askForRematch: () => void;
	recordGameResult: (result: GameResultType) => void;
	isConnected: boolean;
	isConnecting: boolean;
	reconnectAttempts: number;
	lastDisconnectReason: string;
	manualReconnect: () => void;
	showDisconnectionNotification: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
	const [isConnected, setIsConnected] = useState(socket.connected);
	const [socketUserId, setSocketUserId] = useAtom(SocketUserIdAtom);
	const [isConnecting, setIsConnecting] = useState(!socket.connected);
	const [reconnectAttempts, setReconnectAttempts] = useState(0);
	const [lastDisconnectReason, setLastDisconnectReason] = useState<string>('');
	const [showDisconnectionNotification, setShowDisconnectionNotification] =
		useState(false);
	const soundEnabled = useAtomValue(SoundAtom);
	const soundEnabledRef = useRef(soundEnabled);
	const { createRoom, joinRoom, leaveRoom } = useRoomWebSocket();
	const [roomInfo, setRoomInfo] = useAtom(RoomInfoAtom);

	// Update ref when soundEnabled changes
	useEffect(() => {
		soundEnabledRef.current = soundEnabled;
	}, [soundEnabled]);

	const playSound = (sound: string) => {
		if (!soundEnabledRef.current) {
			console.log('Sound disabled, not playing:', sound);
			return;
		}
		console.log(
			'Sound enabled, playing:',
			sound,
			'soundEnabled:',
			soundEnabledRef.current,
		);
		const audio = new Audio(`/sounds/${sound}.mp3`);
		audio.play();
	};

	const { startGame, makeMove, askForRematch } = useGameWebSocket(playSound);
	const { recordGameResult } = useGameStatsSync();

	const onConnect = () => {
		console.log('WebSocket connected, socket ID:', socket.id);
		setIsConnecting(false);
		setIsConnected(true);
		setReconnectAttempts(0);
		setLastDisconnectReason('');
		setShowDisconnectionNotification(false);

		if (!socketUserId) {
			setSocketUserId(socket.id ?? null);
			const user = { id: socket.id };

			socket.emit('identity', user, (response: unknown) => {
				console.log('Identity:', response);
			});
		}
	};

	const onDisconnect = (reason: string) => {
		console.log('WebSocket disconnected, reason:', reason);
		setIsConnected(false);
		setLastDisconnectReason(reason);
		setShowDisconnectionNotification(true);

		// Clear room state when disconnecting
		if (roomInfo) {
			console.log('Clearing room state due to disconnection');
			setRoomInfo(null);
		}

		// Don't clear socketUserId immediately for reconnection attempts
		if (reason === 'io server disconnect') {
			// Server initiated disconnect - clear user ID
			setSocketUserId(null);
		}

		// Set connecting state for reconnection attempts
		setIsConnecting(true);
	};

	const onReconnect = (attemptNumber: number) => {
		console.log('WebSocket reconnecting, attempt:', attemptNumber);
		setReconnectAttempts(attemptNumber);
		setIsConnecting(true);
	};

	const onReconnectAttempt = (attemptNumber: number) => {
		console.log('WebSocket reconnection attempt:', attemptNumber);
		setReconnectAttempts(attemptNumber);
	};

	const onReconnectError = (error: Error) => {
		console.error('WebSocket reconnection error:', error);
		setReconnectAttempts((prev) => prev + 1);
	};

	const onReconnectFailed = () => {
		console.error('WebSocket reconnection failed after all attempts');
		setIsConnecting(false);
		setIsConnected(false);
		setSocketUserId(null);
		// Clear room state when reconnection fails
		if (roomInfo) {
			setRoomInfo(null);
		}
	};

	const onConnectError = (error: Error) => {
		console.error('WebSocket connection error:', error);
		setIsConnecting(false);
		setIsConnected(false);
	};

	// Manual reconnection function
	const manualReconnect = () => {
		console.log('Manual reconnection attempt');
		setIsConnecting(true);
		setReconnectAttempts(0);
		setShowDisconnectionNotification(false);
		socket.connect();
	};

	useEffect(() => {
		console.log('WebSocketProvider - registering connection listeners');

		socket.on('connect', onConnect);
		socket.on('disconnect', onDisconnect);
		socket.on('reconnect', onReconnect);
		socket.on('reconnect_attempt', onReconnectAttempt);
		socket.on('reconnect_error', onReconnectError);
		socket.on('reconnect_failed', onReconnectFailed);
		socket.on('connect_error', onConnectError);

		// If socket is already connected, set the user ID and states
		if (socket.connected) {
			console.log('Socket already connected on mount, socket ID:', socket.id);
			setSocketUserId(socket.id ?? null);
			setIsConnecting(false);
			setIsConnected(true);
		} else {
			console.log('Socket not connected on mount, waiting for connection...');
			setIsConnecting(true);
		}

		return () => {
			socket.off('connect', onConnect);
			socket.off('disconnect', onDisconnect);
			socket.off('reconnect', onReconnect);
			socket.off('reconnect_attempt', onReconnectAttempt);
			socket.off('reconnect_error', onReconnectError);
			socket.off('reconnect_failed', onReconnectFailed);
			socket.off('connect_error', onConnectError);
		};
	}, []); // Empty dependency array - only run once

	const webSocketState = {
		createRoom,
		joinRoom,
		leaveRoom,
		startGame,
		makeMove,
		askForRematch,
		recordGameResult,
		isConnected,
		isConnecting,
		reconnectAttempts,
		lastDisconnectReason,
		manualReconnect,
		showDisconnectionNotification,
	};

	return (
		<WebSocketContext.Provider value={webSocketState}>
			{children}
			{/* Disconnection Notification */}
			{showDisconnectionNotification && (
				<div className='fixed right-4 top-4 z-50 max-w-sm'>
					<div className='glass rounded-lg border-l-4 border-red-500 bg-red-900/20 p-4 shadow-lg'>
						<div className='flex items-start'>
							<div className='flex-shrink-0'>
								<div className='flex h-6 w-6 items-center justify-center rounded-full bg-red-500'>
									<span className='text-xs text-white'>!</span>
								</div>
							</div>
							<div className='ml-3 flex-1'>
								<p className='text-sm font-medium text-red-200'>
									Connection Lost
								</p>
								<p className='mt-1 text-xs text-red-300'>
									{reconnectAttempts > 0
										? `Reconnecting... (${reconnectAttempts}/5)`
										: 'Trying to reconnect...'}
								</p>
								<div className='mt-3 flex space-x-2'>
									<button
										onClick={manualReconnect}
										className='rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700'
									>
										Reconnect
									</button>
									<button
										onClick={() => setShowDisconnectionNotification(false)}
										className='rounded bg-gray-600 px-2 py-1 text-xs text-white hover:bg-gray-700'
									>
										Dismiss
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</WebSocketContext.Provider>
	);
}

export function useWebSocketContext() {
	const context = useContext(WebSocketContext);
	if (!context) {
		throw new Error(
			'useWebSocketContext must be used within a WebSocketProvider',
		);
	}
	return context;
}
