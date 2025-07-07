import { useAtomValue } from 'jotai';
import { CurrentPlayerType } from '@4dots/shared';
import classNames from 'classnames';
import {
	BoardDisksAtom,
	CurrentPlayerAtom,
	RoomInfoAtom,
	WinnerAtom,
} from '@state/room';
import { SocketUserIdAtom } from '@state/socket';
import { BoardCol } from '@organisms/BoardCol/BoardCol';

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
		<div className='w-full h-full flex justify-center items-center flex-col p-2 sm:p-4'>
			<div className='relative w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[450px] h-auto aspect-[400/350]'>
				{/* Board Background */}
				<div className='absolute bg-gradient-to-b from-slate-600 to-slate-800 rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-4 border-slate-700 inset-[-7px]'></div>

				{/* Game Board Content  */}
				<div className='relative z-10 w-full h-full flex'>
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
									'flex-1 flex flex-col relative transition-all duration-200',
									canClick && 'hover:bg-purple-500/20 cursor-pointer group'
								)}
							>
								{/* Hover indicator for current player */}
								{canClick && (
									<div className='absolute inset-0 bg-gradient-to-b from-transparent via-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg'></div>
								)}

								{/* Column content */}
								<div className='relative z-10 w-full h-full flex flex-col'>
									<BoardCol colId={index} />
								</div>

								{/* Column full indicator */}
								{isColumnFull && (
									<div className='absolute top-0 left-0 right-0 h-1 bg-red-500/70 rounded-t-full'></div>
								)}
							</div>
						);
					})}
				</div>

				{/* Board Rim Effect */}
				<div className='absolute inset-[-7px] rounded-xl sm:rounded-2xl border-2 sm:border-4 border-slate-700/60 pointer-events-none shadow-inner'></div>
			</div>
		</div>
	);
}
