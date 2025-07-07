import { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import type { CurrentPlayerType, BoardDisksType } from '@4dots/shared';
import { useRoomWebSocket } from '@hooks/useRoomWebSocket';
import { useGameWebSocket } from '@hooks/useGameWebSocket';
import { SocketUserIdAtom } from '@state/socket';
import { SoundAtom } from '@state/ui';
import { socket } from '@src/socket';

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
	isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
	const [isConnected, setIsConnected] = useState(socket.connected);
	const [socketUserId, setSocketUserId] = useAtom(SocketUserIdAtom);
	const soundEnabled = useAtomValue(SoundAtom);
	const soundEnabledRef = useRef(soundEnabled);
	const { createRoom, joinRoom, leaveRoom } = useRoomWebSocket();

	// Update ref when soundEnabled changes
	useEffect(() => {
		soundEnabledRef.current = soundEnabled;
	}, [soundEnabled]);

	// Create a stable playSound function that always checks the current soundEnabled state
	const playSound = (sound: string) => {
		if (!soundEnabledRef.current) {
			console.log('Sound disabled, not playing:', sound);
			return;
		}
		console.log(
			'Sound enabled, playing:',
			sound,
			'soundEnabled:',
			soundEnabledRef.current
		);
		const audio = new Audio(`/sounds/${sound}.mp3`);
		audio.play();
	};

	const { startGame, makeMove, askForRematch } = useGameWebSocket(playSound);

	const onConnect = () => {
		if (isConnected || socketUserId) {
			return;
		}

		if (!isConnected) {
			setSocketUserId(socket.id ?? null);
			const user = { id: socket.id };

			socket.emit('identity', user, (response: unknown) => {
				console.log('Identity:', response);
			});
		}

		setIsConnected(true);
	};

	const onDisconnect = () => {
		console.log('disconnected');
		setIsConnected(false);
		window.addEventListener('beforeunload', (ev) => {
			ev.preventDefault();
		});
	};

	useEffect(() => {
		console.log('WebSocketProvider - registering connection listeners');

		socket.on('connect', onConnect);
		socket.on('disconnect', onDisconnect);

		return () => {
			socket.off('connect', onConnect);
			socket.off('disconnect', onDisconnect);
		};
	}, [isConnected, socketUserId]);

	const webSocketState = {
		createRoom,
		joinRoom,
		leaveRoom,
		startGame,
		makeMove,
		askForRematch,
		isConnected,
	};

	return (
		<WebSocketContext.Provider value={webSocketState}>
			{children}
		</WebSocketContext.Provider>
	);
}

export function useWebSocketContext() {
	const context = useContext(WebSocketContext);
	if (!context) {
		throw new Error(
			'useWebSocketContext must be used within a WebSocketProvider'
		);
	}
	return context;
}
