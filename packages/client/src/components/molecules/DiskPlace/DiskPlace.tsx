import { useAtomValue } from 'jotai';
import { CurrentPlayerType } from '@4dots/shared';
import { BoardDisksAtom } from '@state/room';
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

		return 'bg-neutral-800';
	};

	return (
		<div className='pointer-events-none flex-1 flex justify-center items-center p-1'>
			<Disk color={getColor()} hasShadow={true} />
		</div>
	);
}
