import { useAtomValue } from 'jotai';
import { CurrentPlayerType } from '@4dots/shared';
import { BoardDisksAtom, CurrentPlayerAtom, WinnerAtom } from '@state/room';
import { BoardCol } from '@organisms/BoardCol';

export function Board() {
	const boardDisks = useAtomValue(BoardDisksAtom);
	const currentPlayer = useAtomValue(CurrentPlayerAtom);
	const winner = useAtomValue(WinnerAtom);

	return (
		<div className='w-full h-full flex justify-center items-center flex-col'>
			<div
				className='bg-neutral-700 rounded-lg p-2 w-full max-w-[360px] h-auto aspect-[360/326] flex flex-row flex-nowrap'
				style={{
					boxShadow:
						'0 8px 12px rgba(0, 0, 0, 0.6), 0 4px 8px rgba(0, 0, 0, 0.4)',
				}}
			>
				{boardDisks[0].map((_, index) => (
					<BoardCol key={index} colId={index} />
				))}
			</div>
			<div className='mt-5'>
				{currentPlayer === CurrentPlayerType.Player1 ? 'Red' : 'Yellow'}
			</div>
			{winner && (
				<div className='mt-5'>
					Winner: {winner === CurrentPlayerType.Player1 ? 'Red' : 'Yellow'}
				</div>
			)}
		</div>
	);
}
