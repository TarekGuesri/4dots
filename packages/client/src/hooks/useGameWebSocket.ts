import { useEffect } from 'react';
import type { IRoomInfo } from '@4dots/shared';
import { useAtom, useAtomValue } from 'jotai';
import { SocketUserIdAtom } from '@state/socket';
import { socket } from '@src/socket';
import { RoomInfoAtom } from '@state/room';

export function useGameWebSocket() {
	const socketUserId = useAtomValue(SocketUserIdAtom);
	const [roomInfo, setRoomInfo] = useAtom(RoomInfoAtom);

	const startGame = () => {
		if (!roomInfo) return;

		setRoomInfo({ ...roomInfo, hasGameStarted: true });
		socket.emit('startGame', roomInfo.id);
	};

	useEffect(() => {
		const onGameStarted = (data: IRoomInfo) => {
			if (!roomInfo) return;

			console.log({ data, socketUserId });
			if (data.visitorId === socketUserId) {
				setRoomInfo({ ...roomInfo, hasGameStarted: true });
			}
		};

		socket.on('startGame', onGameStarted);

		return () => {
			socket.off('startGame', onGameStarted);
		};
	}, [socketUserId, roomInfo]);

	return { startGame };
}
