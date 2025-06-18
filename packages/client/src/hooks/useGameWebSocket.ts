import { useEffect } from 'react';
import type {
	BoardDisksType,
	CurrentPlayerType,
	IRoomInfo,
	SocketEventType,
} from '@4dots/shared';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { SocketUserIdAtom } from '@state/socket';
import { socket } from '@src/socket';
import {
	BoardDisksAtom,
	CurrentPlayerAtom,
	RoomInfoAtom,
	useBoardRematch,
	WinnerAtom,
} from '@state/room';

export function useGameWebSocket() {
	const socketUserId = useAtomValue(SocketUserIdAtom);
	const [roomInfo, setRoomInfo] = useAtom(RoomInfoAtom);
	const setBoardDisks = useSetAtom(BoardDisksAtom);
	const setCurrentPlayer = useSetAtom(CurrentPlayerAtom);
	const setWinner = useSetAtom(WinnerAtom);
	const boardRematch = useBoardRematch();

	const startGame = () => {
		if (!roomInfo) return;

		setRoomInfo({ ...roomInfo, hasGameStarted: true });
		socket.emit<SocketEventType>('startGame', roomInfo.id);
	};

	const askForRematch = () => {
		if (!roomInfo) return;
		console.log({ roomInfo, socketUserId });
		if (roomInfo.player1Id === socketUserId) {
			setRoomInfo({ ...roomInfo, isPlayer1Rematching: true });
		} else {
			setRoomInfo({ ...roomInfo, isPlayer2Rematching: true });
		}

		socket.emit<SocketEventType>('askForRematch', roomInfo.id);
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

		const onRematchRequested = (roomInfo: IRoomInfo) => {
			console.log('rematch requested', roomInfo);
			setRoomInfo(roomInfo);
		};

		const onRematchAccepted = (roomInfo: IRoomInfo) => {
			console.log('rematch accepted', roomInfo);
			setRoomInfo(roomInfo);
			boardRematch();
		};

		socket.on('startGame', onGameStarted);
		socket.on('boardUpdated', onBoardUpdated);
		socket.on('rematchRequested', onRematchRequested);
		socket.on('rematchAccepted', onRematchAccepted);

		return () => {
			socket.off('startGame', onGameStarted);
			socket.off('boardUpdated', onBoardUpdated);
			socket.off('rematchRequested', onRematchRequested);
			socket.off('rematchAccepted', onRematchAccepted);
		};
	}, [socketUserId, roomInfo]);

	return { startGame, makeMove, askForRematch };
}
