import type { SocketEventType } from '@4dots/shared';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { socket } from '@src/socket';
import { SocketUserIdAtom } from '@state/socket';

const URL =
	process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000';
console.log({ URL });

export function useWebsocket() {
	const socketUserId = useRecoilValue(SocketUserIdAtom);
	const [isConnected, setIsConnected] = useState(socket.connected);

	function joinRoom(roomId: string) {
		socket.emit('joinedRoom', { roomId });
	}

	useEffect(() => {
		function onConnect() {
			setIsConnected(true);
			console.log('onConnect');
			console.log({ isConnected });

			const user = { id: socketUserId };

			socket.emit('events', { test: 'test' });
			socket.emit<SocketEventType>('identity', user, (response: unknown) =>
				console.log('Identity:', response)
			);
			socket.emit('events', user, (response: unknown) =>
				console.log('Identity:', response)
			);
		}

		function onDisconnect() {
			setIsConnected(false);
			console.log('onDisconnect');
		}

		socket.on<SocketEventType>('connect', onConnect);
		socket.on<SocketEventType>('disconnect', onDisconnect);

		return () => {
			socket.off<SocketEventType>('connect', onConnect);
			socket.off<SocketEventType>('disconnect', onDisconnect);
		};
	}, []);

	return { joinRoom };
}
