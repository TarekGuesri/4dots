import { useAtomValue } from 'jotai';
import { CurrentPlayerType } from '@4dots/shared';
import { BoardDisksAtom } from '@state/room';
import { Disk } from '@atoms/Disk/Disk';

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
		<div className='flex-1 flex justify-center items-center p-0.5 sm:p-1 relative'>
			{/* Connect 4 Hole - Always visible */}
			<div className='w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-slate-700 border border-slate-800 sm:border-2 shadow-inner'></div>

			{/* Disk - Overlays the hole */}
			{!isEmpty && (
				<div className='absolute inset-0 flex justify-center items-center'>
					<Disk
						color={getColor()}
						hasShadow={true}
						className='w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10'
					/>
				</div>
			)}
		</div>
	);
}
