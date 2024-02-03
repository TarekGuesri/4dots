import { useRecoilValue } from 'recoil';
import { BoardDisksAtom } from '@state/board';
import { CurrentPlayerType } from '@state/types';

interface DiskProps {
	colId: number;
	rowId: number;
}

export function DiskPlace(props: DiskProps) {
	const { colId, rowId } = props;
	const boardDisks = useRecoilValue(BoardDisksAtom);
	const player = boardDisks[rowId][colId];

	const getColor = () => {
		if (player === CurrentPlayerType.Player1) {
			return 'bg-red-500';
		}
		if (player === CurrentPlayerType.Player2) {
			return 'bg-yellow-500';
		}

		return 'bg-white';
	};

	return (
		<div className='pointer-events-none flex-1 flex justify-center items-center'>
			<div className={`${getColor()} rounded-full w-[45px] h-[45px]`} />
		</div>
	);
}
