import { atom, useResetRecoilState } from 'recoil';
import { CurrentPlayer } from './types';
import { StateKeys } from '@constants/StateKeys';
import { BOARD_SIZE } from '@constants/BoardSettings';

export const DiskAtom = atom<Array<Array<CurrentPlayer | null>>>({
	key: StateKeys.BoardDisks,
	default: Array.from({ length: BOARD_SIZE.rows }, () =>
		Array(BOARD_SIZE.columns).fill(null)
	),
});

export const CurrentPlayerAtom = atom<CurrentPlayer>({
	key: StateKeys.BoardCurrentPlayer,
	default: CurrentPlayer.Player1,
});

export const WinnerAtom = atom<CurrentPlayer | null>({
	key: StateKeys.BoardWinner,
	default: null,
});

export function useResetPickerState() {
	const resetDisks = useResetRecoilState(DiskAtom);
	const resetCurrentPlayer = useResetRecoilState(CurrentPlayerAtom);
	const resetWinner = useResetRecoilState(WinnerAtom);

	return () => {
		resetDisks();
		resetCurrentPlayer();
		resetWinner();
	};
}
