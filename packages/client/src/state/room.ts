import { CurrentPlayerType } from '@4dots/shared';
import { atom, useAtom, useSetAtom } from 'jotai';

import { BOARD_SIZE } from '@constants/BoardSettings';

import type { BoardDisksType, IRoomInfo } from '@4dots/shared';

const createEmptyBoard = () => {
	return Array.from({ length: BOARD_SIZE.rows }, () =>
		Array(BOARD_SIZE.columns).fill(null),
	);
};

// Game Statistics Interface
interface GameStats {
	totalGames: number;
	wins: number;
	losses: number;
	draws: number;
	winStreak: number;
	longestWinStreak: number;
}

const initialGameStats: GameStats = {
	totalGames: 0,
	wins: 0,
	losses: 0,
	draws: 0,
	winStreak: 0,
	longestWinStreak: 0,
};

// TODO: Remove this once we have a proper draw pattern
// const createEmptyBoard = () => {
// 	// Create a board with a draw pattern
// 	const board = Array.from({ length: BOARD_SIZE.rows }, () =>
// 		Array(BOARD_SIZE.columns).fill(null)
// 	);

// 	// Fill each row from bottom to top (except first) with a pattern that prevents all wins
// 	for (let row = BOARD_SIZE.rows - 1; row > 0; row--) {
// 		for (let col = 0; col < BOARD_SIZE.columns; col++) {
// 			// Create a pattern that alternates every 3 cells
// 			// This ensures no 4-in-a-row in any direction
// 			board[row][col] =
// 				(Math.floor(col / 3) + row) % 2 === 0
// 					? CurrentPlayerType.Player1
// 					: CurrentPlayerType.Player2;
// 		}
// 	}

// 	return board;
// };

export const BoardDisksAtom = atom<BoardDisksType>(createEmptyBoard());

export const CurrentPlayerAtom = atom<CurrentPlayerType>(
	CurrentPlayerType.Player1,
);

export const WinnerAtom = atom<CurrentPlayerType | null>(null);

export const RoomInfoAtom = atom<IRoomInfo | null>(null);

export const RoomInfoLoadingAtom = atom<boolean>();

export const GameStatsAtom = atom<GameStats>(initialGameStats);

export const GameTimeAtom = atom<number>(0);

export function useResetBoardState() {
	const setBoardDisks = useSetAtom(BoardDisksAtom);
	const setCurrentPlayer = useSetAtom(CurrentPlayerAtom);
	const setWinner = useSetAtom(WinnerAtom);
	const setGameTime = useSetAtom(GameTimeAtom);

	return () => {
		console.log('resetting board state');

		setBoardDisks(createEmptyBoard());
		setCurrentPlayer(CurrentPlayerType.Player1);
		setWinner(null);
		setGameTime(0);
	};
}

export function useResetRoomState() {
	const setRoomInfo = useSetAtom(RoomInfoAtom);
	const setRoomInfoLoading = useSetAtom(RoomInfoLoadingAtom);
	const resetBoardState = useResetBoardState();

	return () => {
		setRoomInfo(null);
		setRoomInfoLoading(true);
		resetBoardState();
	};
}

export function useBoardRematch() {
	const setBoardDisks = useSetAtom(BoardDisksAtom);
	const setCurrentPlayer = useSetAtom(CurrentPlayerAtom);
	const setWinner = useSetAtom(WinnerAtom);
	const setGameTime = useSetAtom(GameTimeAtom);
	const [roomInfo, setRoomInfo] = useAtom(RoomInfoAtom);

	return () => {
		console.log('rematching board state');

		setBoardDisks(createEmptyBoard());
		setCurrentPlayer(CurrentPlayerType.Player1);
		setWinner(null);
		setGameTime(0);
		if (roomInfo) {
			setRoomInfo({
				...roomInfo,
				isPlayer1Rematching: false,
				isPlayer2Rematching: false,
			});
		}
	};
}

export function useUpdateGameStats() {
	const [gameStats, setGameStats] = useAtom(GameStatsAtom);

	return (result: 'win' | 'loss' | 'draw') => {
		const newStats = { ...gameStats };
		newStats.totalGames += 1;

		if (result === 'win') {
			newStats.wins += 1;
			newStats.winStreak += 1;
			newStats.longestWinStreak = Math.max(
				newStats.longestWinStreak,
				newStats.winStreak,
			);
		} else if (result === 'loss') {
			newStats.losses += 1;
			newStats.winStreak = 0;
		} else {
			newStats.draws += 1;
			newStats.winStreak = 0;
		}

		setGameStats(newStats);
	};
}
