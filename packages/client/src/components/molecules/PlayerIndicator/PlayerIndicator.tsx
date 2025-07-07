import { CurrentPlayerType } from '@4dots/shared';
import classNames from 'classnames';
import { Star as StarIcon } from '@mui/icons-material';
import { useAtomValue } from 'jotai';
import { Disk } from '@atoms/Disk/Disk';
import { SocketUserIdAtom } from '@state/socket';
import { RoomInfoAtom } from '@state/room';

interface PlayerIndicatorProps {
	player: CurrentPlayerType;
	currentPlayer: CurrentPlayerType;
}

export function PlayerIndicator(props: PlayerIndicatorProps) {
	const { currentPlayer, player } = props;
	const socketUserId = useAtomValue(SocketUserIdAtom);
	const roomInfo = useAtomValue(RoomInfoAtom);

	const getColor = () => {
		if (player === CurrentPlayerType.Player1) {
			return 'bg-red-500';
		}
		return 'bg-yellow-500';
	};

	const isCurrentPlayer = () => {
		if (player === CurrentPlayerType.Player1) {
			return currentPlayer === CurrentPlayerType.Player1;
		}
		return currentPlayer === CurrentPlayerType.Player2;
	};

	const isYou = () => {
		if (player === CurrentPlayerType.Player1) {
			return socketUserId === roomInfo?.player1Id;
		}
		return socketUserId === roomInfo?.player2Id;
	};

	return (
		<div
			className={classNames(
				'glass rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center',
				isCurrentPlayer()
					? 'border-2 border-purple-400 shadow-lg shadow-purple-500/25'
					: 'border-2 border-transparent opacity-70'
			)}
		>
			{/* Label row: star is absolutely positioned, label is always centered */}
			<div
				className='relative flex items-center justify-center mb-2 w-full min-w-[108px]'
				style={{ height: '1.75rem' }}
			>
				{isYou() && (
					<span className='absolute left-1 flex items-center'>
						<StarIcon className='text-yellow-400 text-lg sm:text-xl' />
					</span>
				)}
				<span
					className={classNames(
						'block w-full text-center',
						'text-slate-200',
						isYou() ? 'font-bold' : 'font-normal',
						'whitespace-nowrap text-sm sm:text-base'
					)}
				>
					{isYou() ? 'You' : 'Opponent'}
				</span>
			</div>

			{/* Disk with status dot in top-right */}
			<div className='flex items-center justify-center mb-2'>
				<div className='relative'>
					<Disk
						color={getColor()}
						width={40}
						height={40}
						isWinner={isCurrentPlayer()}
					/>
					<div
						className={classNames(
							'absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2',
							isCurrentPlayer()
								? 'bg-green-400 border-white animate-pulse'
								: 'bg-slate-400 border-slate-300'
						)}
					></div>
				</div>
			</div>
		</div>
	);
}
