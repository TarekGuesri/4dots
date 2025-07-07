import { CurrentPlayerType } from '@4dots/shared';
import { Star as StarIcon } from '@mui/icons-material';
import classNames from 'classnames';
import { useAtomValue } from 'jotai';

import { Disk } from '@atoms/Disk/Disk';
import { RoomInfoAtom } from '@state/room';
import { SocketUserIdAtom } from '@state/socket';

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
				'glass flex flex-col items-center justify-center rounded-lg p-3 sm:rounded-xl sm:p-4',
				isCurrentPlayer()
					? 'border-2 border-purple-400 shadow-lg shadow-purple-500/25'
					: 'border-2 border-transparent opacity-70',
			)}
		>
			{/* Label row: star is absolutely positioned, label is always centered */}
			<div
				className='relative mb-2 flex w-full min-w-[108px] items-center justify-center'
				style={{ height: '1.75rem' }}
			>
				{isYou() && (
					<span className='absolute left-1 flex items-center'>
						<StarIcon className='text-lg text-yellow-400 sm:text-xl' />
					</span>
				)}
				<span
					className={classNames(
						'block w-full text-center',
						'text-slate-200',
						isYou() ? 'font-bold' : 'font-normal',
						'whitespace-nowrap text-sm sm:text-base',
					)}
				>
					{isYou() ? 'You' : 'Opponent'}
				</span>
			</div>

			{/* Disk with status dot in top-right */}
			<div className='mb-2 flex items-center justify-center'>
				<div className='relative'>
					<Disk
						color={getColor()}
						width={40}
						height={40}
						isWinner={isCurrentPlayer()}
					/>
					<div
						className={classNames(
							'absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 sm:h-4 sm:w-4',
							isCurrentPlayer()
								? 'animate-pulse border-white bg-green-400'
								: 'border-slate-300 bg-slate-400',
						)}
					></div>
				</div>
			</div>
		</div>
	);
}
