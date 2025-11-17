import { CurrentPlayerType } from '@4dots/shared';
import {
	Settings as SettingsIcon,
	Timer as TimerIcon,
	VolumeOff as VolumeOffIcon,
	VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import classNames from 'classnames';
import { useAtomValue } from 'jotai';

import { PlayerIndicator } from '@molecules/PlayerIndicator/PlayerIndicator';
import { CurrentPlayerAtom, GameTimeAtom } from '@state/room';
import { SoundAtom } from '@state/ui';
import { formatTime } from '@utils/helpers';

interface GameHeaderDesktopProps {
	isUserPlayer1: boolean;
	toggleSound: () => void;
}

export function GameHeaderDesktop(props: GameHeaderDesktopProps) {
	const { isUserPlayer1, toggleSound } = props;
	const gameTime = useAtomValue(GameTimeAtom);
	const soundEnabled = useAtomValue(SoundAtom);
	const currentPlayer = useAtomValue(CurrentPlayerAtom);

	return (
		<div className='hidden w-full flex-row items-center justify-center gap-6 sm:flex lg:gap-8'>
			{/* You */}
			<PlayerIndicator
				player={
					isUserPlayer1 ? CurrentPlayerType.Player1 : CurrentPlayerType.Player2
				}
				currentPlayer={currentPlayer}
			/>
			{/* Timer/Settings */}
			<div className='flex flex-col items-center justify-center gap-2 sm:gap-3'>
				<div className='glass rounded-lg p-3 text-center sm:rounded-xl sm:p-4'>
					<div className='mb-1 flex items-center justify-center gap-1 sm:mb-2 sm:gap-2'>
						<TimerIcon className='text-sm text-purple-400 sm:text-base' />
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
					</div>
					<div className='flex flex-row justify-center gap-2 sm:gap-3'>
						<button
							onClick={toggleSound}
							className='rounded-lg p-1.5 text-slate-300 transition-colors hover:text-white sm:p-2'
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
							className='cursor-not-allowed rounded-lg p-1.5 text-slate-300 opacity-50 sm:p-2'
							aria-label='Settings'
						>
							<SettingsIcon fontSize='small' />
						</button>
					</div>
				</div>
			</div>
			{/* Opponent  */}
			<PlayerIndicator
				player={
					isUserPlayer1 ? CurrentPlayerType.Player2 : CurrentPlayerType.Player1
				}
				currentPlayer={currentPlayer}
			/>
		</div>
	);
}
