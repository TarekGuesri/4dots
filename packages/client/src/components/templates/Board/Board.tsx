import { useAtomValue } from 'jotai';
import { BoardDisksAtom, CurrentPlayerAtom, WinnerAtom } from '@state/room';
import { BoardCol } from '@organisms/BoardCol';
import { CurrentPlayerType } from '@state/types';

export function Board() {
	const boardDisks = useAtomValue(BoardDisksAtom);
	const currentPlayer = useAtomValue(CurrentPlayerAtom);
	const winner = useAtomValue(WinnerAtom);

	return (
		<div className='h-screen'>
			<div className='bg-red-500 w-[950px] h-full flex justify-center items-center flex-col'>
				<div className='bg-sky-500 w-[490px] h-[420px] flex flex-row flex-nowrap'>
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
		</div>
	);
}
