import { useRecoilState } from 'recoil';
import { BOARD_SIZE } from '@constants/BoardSettings';
import { DiskPlace } from '@molecules/DiskPlace';
import { DiskAtom, CurrentPlayerAtom, WinnerAtom } from '@state/board';
import { CurrentPlayer } from '@state/types';

interface BoardColProps {
	colId: number;
}

const rows = Array(BOARD_SIZE.rows).fill(null);

const numRows = 6;
// const numCols = 7;

export function BoardCol(props: BoardColProps) {
	const { colId } = props;

	const [board, setBoard] = useRecoilState(DiskAtom);
	const [currentPlayer, setCurrentPlayer] = useRecoilState(CurrentPlayerAtom);
	const [winner, setWinner] = useRecoilState(WinnerAtom);

	const checkWinner = (row: number, col: number) => {
		console.log({ row, col });
		return false;
	};

	const handleClickCol = () => {
		if (winner || board[0][colId]) return;

		const newBoard = board.map((row) => [...row]);

		for (let i = numRows - 1; i >= 0; i--) {
			if (!newBoard[i][colId]) {
				newBoard[i][colId] = currentPlayer;

				if (checkWinner(i, colId)) {
					setWinner(currentPlayer);
				} else {
					setCurrentPlayer(
						currentPlayer === CurrentPlayer.Player1
							? CurrentPlayer.Player2
							: CurrentPlayer.Player1
					);
				}

				setBoard(newBoard);
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
			{rows.map((_, index) => (
				<DiskPlace key={index} colId={colId} rowId={index} />
			))}
		</div>
	);
}
