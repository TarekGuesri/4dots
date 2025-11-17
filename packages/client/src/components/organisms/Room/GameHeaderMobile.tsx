import { CurrentPlayerType } from '@4dots/shared';
import {
	Settings as SettingsIcon,
	Timer as TimerIcon,
	VolumeOff as VolumeOffIcon,
	VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import classNames from 'classnames';
import { useAtomValue } from 'jotai';

import { Disk } from '@atoms/Disk/Disk';
import { CurrentPlayerAtom, GameTimeAtom } from '@state/room';
import { SoundAtom } from '@state/ui';
import { formatTime } from '@utils/helpers';

interface GameHeaderMobileProps {
	isUserPlayer1: boolean;
	toggleSound: () => void;
}

export function GameHeaderMobile(props: GameHeaderMobileProps) {
	const { isUserPlayer1, toggleSound } = props;
	const gameTime = useAtomValue(GameTimeAtom);
	const soundEnabled = useAtomValue(SoundAtom);
	const currentPlayer = useAtomValue(CurrentPlayerAtom);

	const youColor = isUserPlayer1 ? 'bg-red-500' : 'bg-yellow-500';
	const opponentColor = isUserPlayer1 ? 'bg-yellow-500' : 'bg-red-500';
	const isYouTurn =
		(isUserPlayer1 && currentPlayer === CurrentPlayerType.Player1) ||
		(!isUserPlayer1 && currentPlayer === CurrentPlayerType.Player2);

	const isOpponentTurn = !isYouTurn;

	return (
		<div className='mb-3 flex w-full justify-center sm:hidden'>
			<div className='glass flex w-full max-w-xs flex-col items-center rounded-xl p-3'>
				<div className='flex w-full flex-row items-end justify-between gap-4'>
					{/* You  */}
					<div className='flex h-full flex-1 flex-col items-center justify-center'>
						<span className='mb-1 text-xs font-semibold text-slate-300'>
							You
						</span>
						<div className='relative flex items-center justify-center'>
							<Disk color={youColor} width={32} height={32} />
							<div
								className={
									'absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 ' +
									(isYouTurn
										? 'animate-pulse border-white bg-green-400'
										: 'border-slate-300 bg-slate-400')
								}
							></div>
						</div>
					</div>
					{/* Timer/Settings */}
					<div className='flex flex-1 flex-col items-center'>
						<div className='glass flex flex-col items-center justify-center rounded-lg p-2 text-center'>
							<TimerIcon className='mb-1 text-base text-purple-400' />
							<div className='relative w-12 text-center sm:w-14 lg:w-16'>
								<span
									className={classNames(
										'inline-block text-lg font-bold transition-transform duration-300 sm:text-xl lg:text-2xl',
										gameTime <= 10
											? 'scale-125 animate-pulse text-red-500'
											: 'text-slate-200',
									)}
								>
									{formatTime(gameTime)}
								</span>
							</div>
							<div className='mt-1 flex flex-row justify-center gap-1'>
								<button
									onClick={toggleSound}
									className='rounded-lg p-1 text-slate-300 transition-colors hover:text-white'
									aria-label='Toggle Sound'
								>
									{soundEnabled ? (
										<VolumeUpIcon fontSize='small' />
									) : (
										<VolumeOffIcon fontSize='small' />
									)}
								</button>
								<button
									disabled
									className='cursor-not-allowed rounded-lg p-1 text-slate-300 opacity-50'
									aria-label='Settings'
								>
									<SettingsIcon fontSize='small' />
								</button>
							</div>
						</div>
					</div>
					{/* Opponent */}
					<div className='flex h-full flex-1 flex-col items-center justify-center'>
						<span className='mb-1 text-xs font-semibold text-slate-300'>
							Opponent
						</span>
						<div className='relative flex items-center justify-center'>
							<Disk color={opponentColor} width={32} height={32} />
							<div
								className={
									'absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 ' +
									(isOpponentTurn
										? 'animate-pulse border-white bg-green-400'
										: 'border-slate-300 bg-slate-400')
								}
							></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
