import { useEffect } from 'react';
import type { IRoomInfo } from '@4dots/shared';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { HasGameStartedAtom } from '@state/room';
import { SocketUserIdAtom } from '@state/socket';
import { socket } from '@src/socket';

export function useGameWebSocket() {
	const socketUserId = useRecoilValue(SocketUserIdAtom);
	const setHasGameStarted = useSetRecoilState(HasGameStartedAtom);

	const startGame = (roomId: string) => {
		setHasGameStarted(true);

		socket.emit('startGame', roomId);
	};

	useEffect(() => {
		const onGameStarted = (data: IRoomInfo) => {
			console.log({ data, socketUserId });
			if (data.visitorId === socketUserId) {
				setHasGameStarted(true);
			}
		};

		socket.on('startGame', onGameStarted);

		return () => {
			socket.off('startGame', onGameStarted);
		};
	}, [socketUserId]);

	return { startGame };
}
