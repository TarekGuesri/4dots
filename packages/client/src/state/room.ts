import { atom, useResetRecoilState } from 'recoil';
import type { IRoomInfo } from '@4dots/shared';
import type { BoardDisksType } from './types';
import { CurrentPlayerType } from './types';
import { StateKeys } from '@constants/StateKeys';
import { BOARD_SIZE } from '@constants/BoardSettings';

const createEmptyBoard = () =>
	Array.from({ length: BOARD_SIZE.rows }, () =>
		Array(BOARD_SIZE.columns).fill(null)
	);

export const BoardDisksAtom = atom<BoardDisksType>({
	key: StateKeys.RoomBoardDisks,
	default: createEmptyBoard(),
});

export const CurrentPlayerAtom = atom<CurrentPlayerType>({
	key: StateKeys.RoomBoardCurrentPlayer,
	default: CurrentPlayerType.Player1,
});

export const WinnerAtom = atom<CurrentPlayerType | null>({
	key: StateKeys.RoomBoardWinner,
	default: null,
});

export const RoomInfoAtom = atom<IRoomInfo | null>({
	key: StateKeys.RoomInfo,
	default: null,
});

export const RoomInfoLoadingAtom = atom<boolean>({
	key: StateKeys.RoomInfoLoading,
	default: true,
});

export function useResetBoardState() {
	const resetDisks = useResetRecoilState(BoardDisksAtom);
	const resetCurrentPlayer = useResetRecoilState(CurrentPlayerAtom);
	const resetWinner = useResetRecoilState(WinnerAtom);

	return () => {
		resetDisks();
		resetCurrentPlayer();
		resetWinner();
	};
}

export function useResetRoomState() {
	const reestRoomInfo = useResetRecoilState(RoomInfoAtom);
	const reestRoomInfoLoading = useResetRecoilState(RoomInfoLoadingAtom);

	return () => {
		reestRoomInfo();
		reestRoomInfoLoading();
	};
}
