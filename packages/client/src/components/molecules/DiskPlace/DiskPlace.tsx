import { CurrentPlayerType } from '@4dots/shared';
import { useAtomValue } from 'jotai';

import { Disk } from '@atoms/Disk/Disk';
import { BoardDisksAtom } from '@state/room';

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

		return 'bg-transparent';
	};

	const isEmpty = player === null;

	return (
		<div className='relative flex flex-1 items-center justify-center p-0.5 sm:p-1'>
			{/* Connect 4 Hole - Always visible */}
			<div className='h-8 w-8 rounded-full border border-slate-800 bg-slate-700 shadow-inner sm:h-10 sm:w-10 sm:border-2 lg:h-12 lg:w-12'></div>

			{/* Disk - Overlays the hole */}
			{!isEmpty && (
				<div className='absolute inset-0 flex items-center justify-center'>
					<Disk
						color={getColor()}
						hasShadow={true}
						className='h-7 w-7 sm:h-9 sm:w-9 lg:h-10 lg:w-10'
					/>
				</div>
			)}
		</div>
	);
}
