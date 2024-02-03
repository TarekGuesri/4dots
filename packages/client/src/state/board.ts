import { atom, useResetRecoilState } from 'recoil';
import type { BoardDisksType } from './types';
import { CurrentPlayerType } from './types';
import { StateKeys } from '@constants/StateKeys';
import { BOARD_SIZE } from '@constants/BoardSettings';

const createEmptyBoard = () =>
	Array.from({ length: BOARD_SIZE.rows }, () =>
		Array(BOARD_SIZE.columns).fill(null)
	);

export const BoardDisksAtom = atom<BoardDisksType>({
	key: StateKeys.BoardDisks,
	default: createEmptyBoard(),
});

export const CurrentPlayerAtom = atom<CurrentPlayerType>({
	key: StateKeys.BoardCurrentPlayer,
	default: CurrentPlayerType.Player1,
});

export const WinnerAtom = atom<CurrentPlayerType | null>({
	key: StateKeys.BoardWinner,
	default: null,
});

export function useResetPickerState() {
	const resetDisks = useResetRecoilState(BoardDisksAtom);
	const resetCurrentPlayer = useResetRecoilState(CurrentPlayerAtom);
	const resetWinner = useResetRecoilState(WinnerAtom);

	return () => {
		resetDisks();
		resetCurrentPlayer();
		resetWinner();
	};
}
