import { CurrentPlayerType } from '@4dots/shared';
import classNames from 'classnames';
import { useAtomValue } from 'jotai';

import { BoardCol } from '@organisms/BoardCol/BoardCol';
import {
	BoardDisksAtom,
	CurrentPlayerAtom,
	RoomInfoAtom,
	WinnerAtom,
} from '@state/room';
import { SocketUserIdAtom } from '@state/socket';

export function Board() {
	const boardDisks = useAtomValue(BoardDisksAtom);
	const currentPlayer = useAtomValue(CurrentPlayerAtom);
	const roomInfo = useAtomValue(RoomInfoAtom);
	const winner = useAtomValue(WinnerAtom);
	const socketUserId = useAtomValue(SocketUserIdAtom);

	const isCurrentPlayer =
		(currentPlayer === CurrentPlayerType.Player1 &&
			roomInfo?.player1Id === socketUserId) ||
		(currentPlayer === CurrentPlayerType.Player2 &&
			roomInfo?.player2Id === socketUserId);

	return (
		<div className='flex h-full w-full flex-col items-center justify-center p-2 sm:p-4'>
			<div className='relative aspect-[400/350] h-auto w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[450px]'>
				{/* Board Background */}
				<div className='absolute inset-[-7px] rounded-xl border-2 border-slate-700 bg-gradient-to-b from-slate-600 to-slate-800 shadow-2xl sm:rounded-2xl sm:border-4'></div>

				{/* Game Board Content  */}
				<div className='relative z-10 flex h-full w-full'>
					{boardDisks[0].map((_, index) => {
						const isColumnFull = boardDisks[0][index] !== null;
						const canClick =
							!winner &&
							!isColumnFull &&
							isCurrentPlayer &&
							roomInfo?.hasGameStarted;

						return (
							<div
								key={index}
								className={classNames(
									'relative flex flex-1 flex-col transition-all duration-200',
									canClick && 'group cursor-pointer hover:bg-purple-500/20',
								)}
							>
								{/* Hover indicator for current player */}
								{canClick && (
									<div className='pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-b from-transparent via-purple-400/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100'></div>
								)}

								{/* Column content */}
								<div className='relative z-10 flex h-full w-full flex-col'>
									<BoardCol colId={index} />
								</div>

								{/* Column full indicator */}
								{isColumnFull && (
									<div className='absolute left-0 right-0 top-0 h-1 rounded-t-full bg-red-500/70'></div>
								)}
							</div>
						);
					})}
				</div>

				{/* Board Rim Effect */}
				<div className='pointer-events-none absolute inset-[-7px] rounded-xl border-2 border-slate-700/60 shadow-inner sm:rounded-2xl sm:border-4'></div>
			</div>
		</div>
	);
}
