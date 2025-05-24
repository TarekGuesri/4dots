import { useEffect } from 'react';
import type { IRoomInfo, SocketEventType } from '@4dots/shared';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { SocketUserIdAtom } from '@state/socket';
import { socket } from '@src/socket';
import {
	BoardDisksAtom,
	CurrentPlayerAtom,
	RoomInfoAtom,
	WinnerAtom,
} from '@state/room';
import type { BoardDisksType, CurrentPlayerType } from '@state/types';

export function useGameWebSocket() {
	const socketUserId = useAtomValue(SocketUserIdAtom);
	const [roomInfo, setRoomInfo] = useAtom(RoomInfoAtom);
	const setBoardDisks = useSetAtom(BoardDisksAtom);
	const setCurrentPlayer = useSetAtom(CurrentPlayerAtom);
	const setWinner = useSetAtom(WinnerAtom);

	const startGame = () => {
		if (!roomInfo) return;

		setRoomInfo({ ...roomInfo, hasGameStarted: true });
		socket.emit<SocketEventType>('startGame', roomInfo.id);
	};

	const makeMove = ({
		currentPlayer,
		newBoard,
		winner,
	}: {
		newBoard: BoardDisksType;
		currentPlayer: CurrentPlayerType;
		winner: CurrentPlayerType | null;
	}) => {
		if (!roomInfo) return;

		setBoardDisks(newBoard);
		socket.emit('makeMove', {
			newBoard,
			currentPlayer,
			winner,
			roomId: roomInfo.id,
		});
	};

	useEffect(() => {
		const onGameStarted = (data: IRoomInfo) => {
			if (!roomInfo) return;

			console.log({ data, socketUserId });
			if (data.visitorId === socketUserId) {
				setRoomInfo({ ...roomInfo, hasGameStarted: true });
			}
		};

		const onBoardUpdated = ({
			newBoard,
			currentPlayer,
			winner,
		}: {
			newBoard: BoardDisksType;
			currentPlayer: CurrentPlayerType;
			winner: CurrentPlayerType | null;
		}) => {
			setBoardDisks(newBoard);
			setCurrentPlayer(currentPlayer);
			setWinner(winner);
		};

		socket.on('startGame', onGameStarted);
		socket.on('boardUpdated', onBoardUpdated);

		return () => {
			socket.off('startGame', onGameStarted);
			socket.off('boardUpdated', onBoardUpdated);
		};
	}, [socketUserId, roomInfo]);

	return { startGame, makeMove };
}
