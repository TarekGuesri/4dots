import type { IRoomInfo } from '@4dots/shared';
import { atom, useAtom } from 'jotai';
import type { BoardDisksType } from './types';
import { CurrentPlayerType } from './types';
import { BOARD_SIZE } from '@constants/BoardSettings';

const createEmptyBoard = () =>
	Array.from({ length: BOARD_SIZE.rows }, () =>
		Array(BOARD_SIZE.columns).fill(null)
	);

export const BoardDisksAtom = atom<BoardDisksType>(createEmptyBoard());

export const HasGameStartedAtom = atom<boolean>(false);

export const CurrentPlayerAtom = atom<CurrentPlayerType>(
	CurrentPlayerType.Player1
);

export const WinnerAtom = atom<CurrentPlayerType | null>(null);

export const RoomInfoAtom = atom<IRoomInfo | null>(null);

export const RoomInfoLoadingAtom = atom<boolean>();

export function useResetBoardState() {
	const [, setBoardDisks] = useAtom(BoardDisksAtom);
	const [, setCurrentPlayer] = useAtom(CurrentPlayerAtom);
	const [, setWinner] = useAtom(WinnerAtom);

	return () => {
		setBoardDisks(createEmptyBoard());
		setCurrentPlayer(CurrentPlayerType.Player1);
		setWinner(null);
	};
}

export function useResetRoomState() {
	const [, setRoomInfo] = useAtom(RoomInfoAtom);
	const [, setRoomInfoLoading] = useAtom(RoomInfoLoadingAtom);

	return () => {
		setRoomInfo(null);
		setRoomInfoLoading(true);
	};
}
