import { useAtomValue } from 'jotai';
import { BoardDisksAtom } from '@state/room';
import { CurrentPlayerType } from '@state/types';
import { Disk } from '@atoms/Disk';

interface DiskProps {
	colId: number;
	rowId: number;
}

export function DiskPlace(props: DiskProps) {
	const { colId, rowId } = props;
	const boardDisks = useAtomValue(BoardDisksAtom);
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
			<Disk color={getColor()} />
		</div>
	);
}
