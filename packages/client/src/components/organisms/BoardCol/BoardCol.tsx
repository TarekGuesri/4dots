import { useAtom } from 'jotai';
import { BoardDisksAtom, CurrentPlayerAtom, WinnerAtom } from '@state/room';
import { BOARD_SIZE } from '@constants/BoardSettings';
import { DiskPlace } from '@molecules/DiskPlace';
import type { BoardDisksType } from '@state/types';
import { CurrentPlayerType } from '@state/types';
import { checkWinner } from '@utils/helpers';

interface BoardColProps {
	colId: number;
}

export function BoardCol(props: BoardColProps) {
	const { colId } = props;
	const [boardDisks, setBoardDisks] = useAtom(BoardDisksAtom);
	const [currentPlayer, setCurrentPlayer] = useAtom(CurrentPlayerAtom);
	const [winner, setWinner] = useAtom(WinnerAtom);

	const handleClickCol = () => {
		if (winner || boardDisks[0][colId]) return;

		const newBoard: BoardDisksType = boardDisks.map((row) => [...row]);

		console.log({ newBoard });

		for (let i = BOARD_SIZE.rows - 1; i >= 0; i--) {
			if (!newBoard[i][colId]) {
				newBoard[i][colId] = currentPlayer;

				if (checkWinner(i, colId, currentPlayer, newBoard)) {
					setWinner(currentPlayer);
				} else {
					setCurrentPlayer(
						currentPlayer === CurrentPlayerType.Player1
							? CurrentPlayerType.Player2
							: CurrentPlayerType.Player1
					);
				}

				setBoardDisks(newBoard);
				break;
			}
		}
	};

	if (winner) {
		console.log({ winner });
	}

	return (
		<div
			className='flex-1 flex flex-col hover:bg-sky-600 cursor-pointer'
			onClick={handleClickCol}
		>
			{boardDisks.map((_, index) => (
				<DiskPlace key={index} colId={colId} rowId={index} />
			))}
		</div>
	);
}
