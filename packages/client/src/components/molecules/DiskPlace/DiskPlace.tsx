import { useRecoilValue } from 'recoil';
import { DiskAtom } from '@state/board';
import { CurrentPlayer } from '@state/types';

interface DiskProps {
	colId: number;
	rowId: number;
}

export function DiskPlace(props: DiskProps) {
	const { colId, rowId } = props;
	const board = useRecoilValue(DiskAtom);
	const player = board[rowId][colId];

	const getColor = () => {
		if (player === CurrentPlayer.Player1) {
			return 'bg-red-500';
		}
		if (player === CurrentPlayer.Player2) {
			return 'bg-yellow-500';
		}

		return 'bg-white';
	};

	return (
		<div className='pointer-events-none flex-1 flex justify-center items-center'>
			<div className={`${getColor()} rounded-full w-[45px] h-[45px]`}>
				col :{colId}
				<br />
				row: {rowId}
			</div>
		</div>
	);
}
