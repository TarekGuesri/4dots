import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { useRoomWebSocket } from './useRoomWebSocket';
import { useGameWebSocket } from './useGameWebSocket';
import { SocketUserIdAtom } from '@state/socket';
import { socket } from '@src/socket';

export function useWebSocket() {
	const [isConnected, setIsConnected] = useState(socket.connected);
	const [socketUserId, setSocketUserId] = useAtom(SocketUserIdAtom);
	const { createRoom, joinRoom, leaveRoom } = useRoomWebSocket();
	const { startGame, makeMove } = useGameWebSocket();

	const onConnect = () => {
		if (isConnected || socketUserId) {
			return;
		}

		if (!isConnected) {
			setSocketUserId(socket.id ?? null);
			const user = { id: socket.id };

			// TODO: Add a loading state and error handling when user is connecting to the server
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
		socket.on('connect', onConnect);
		socket.on('disconnect', onDisconnect);

		return () => {
			socket.off('connect', onConnect);
			socket.off('disconnect', onDisconnect);
		};
	}, [isConnected, socketUserId]);

	return { createRoom, joinRoom, leaveRoom, startGame, makeMove, isConnected };
}
