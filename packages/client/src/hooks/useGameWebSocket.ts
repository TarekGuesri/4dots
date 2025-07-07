import { CurrentPlayerType } from '@4dots/shared';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';

import { socket } from '@src/socket';
import {
	BoardDisksAtom,
	CurrentPlayerAtom,
	RoomInfoAtom,
	useBoardRematch,
	WinnerAtom,
} from '@state/room';
import { SocketUserIdAtom } from '@state/socket';

import type { BoardDisksType, IRoomInfo, SocketEventType } from '@4dots/shared';
import type { Sound } from '@app-types';

// Global flag to ensure event listeners are only registered once
let areEventListenersRegistered = false;

export function useGameWebSocket(playSound: (sound: Sound) => void) {
	const socketUserId = useAtomValue(SocketUserIdAtom);
	const [roomInfo, setRoomInfo] = useAtom(RoomInfoAtom);
	const setBoardDisks = useSetAtom(BoardDisksAtom);
	const setCurrentPlayer = useSetAtom(CurrentPlayerAtom);
	const setWinner = useSetAtom(WinnerAtom);
	const boardRematch = useBoardRematch();

	// Use refs to store latest values for event handlers
	const roomInfoRef = useRef(roomInfo);
	const socketUserIdRef = useRef(socketUserId);

	// Update refs when values change
	useEffect(() => {
		roomInfoRef.current = roomInfo;
	}, [roomInfo]);

	useEffect(() => {
		socketUserIdRef.current = socketUserId;
	}, [socketUserId]);

	const onGameStarted = useCallback(
		(data: IRoomInfo) => {
			const currentRoomInfo = roomInfoRef.current;
			const currentSocketUserId = socketUserIdRef.current;

			if (!currentRoomInfo) return;

			console.log({ data, socketUserId: currentSocketUserId });
			if (data.visitorId === currentSocketUserId) {
				setRoomInfo({ ...currentRoomInfo, hasGameStarted: true });
			}
		},
		[setRoomInfo],
	);

	const onBoardUpdated = useCallback(
		({
			newBoard,
			currentPlayer,
			winner,
		}: {
			newBoard: BoardDisksType;
			currentPlayer: CurrentPlayerType;
			winner: CurrentPlayerType | null;
		}) => {
			const currentRoomInfo = roomInfoRef.current;

			if (!currentRoomInfo) return;

			setBoardDisks(newBoard);
			setCurrentPlayer(currentPlayer);
			setWinner(winner);

			console.log('board updated');
			// console.log({ winner, currentPlayer, socketUserId });

			const userPlayerType =
				socketUserId === currentRoomInfo.player1Id
					? CurrentPlayerType.Player1
					: CurrentPlayerType.Player2;

			console.log({
				userPlayerType,
				winner,
				currentPlayer,
				currentRoomInfo,
			});

			// If game has a winner
			if (winner) {
				// Since the turn didn't change, it means that userPlayerType is reversed
				if (winner === userPlayerType) {
					console.log('game won');
					playSound('game_won');
				} else {
					console.log('game lost');
					playSound('game_lost');
				}
			}
			// If game is still ongoing
			else {
				// If it's now the current player's turn, it means the opponent just moved
				if (currentPlayer === userPlayerType) {
					console.log('opponent move');
					playSound('opponent_move');
				} else {
					console.log('player move');
					playSound('player_move');
				}
			}
		},
		[setBoardDisks, setCurrentPlayer, setWinner, playSound],
	);

	const onRematchRequested = useCallback(
		(roomInfo: IRoomInfo) => {
			console.log('rematch requested', roomInfo);
			setRoomInfo(roomInfo);
		},
		[setRoomInfo],
	);

	const onRematchAccepted = useCallback(
		(roomInfo: IRoomInfo) => {
			console.log('rematch accepted', roomInfo);
			setRoomInfo(roomInfo);
			boardRematch();
		},
		[setRoomInfo, boardRematch],
	);

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

	// Only register event listeners once
	useEffect(() => {
		if (areEventListenersRegistered) {
			return;
		}

		socket.on('startGame', onGameStarted);
		socket.on('boardUpdated', onBoardUpdated);
		socket.on('rematchRequested', onRematchRequested);
		socket.on('rematchAccepted', onRematchAccepted);

		areEventListenersRegistered = true;

		return () => {
			// Only cleanup when component unmounts (app closes)
			socket.off('startGame', onGameStarted);
			socket.off('boardUpdated', onBoardUpdated);
			socket.off('rematchRequested', onRematchRequested);
			socket.off('rematchAccepted', onRematchAccepted);
			areEventListenersRegistered = false;
		};
	}, []); // Empty dependency array - only run once

	return { startGame, makeMove, askForRematch };
}
