import {
	Star as StarIcon,
	TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAtomValue } from 'jotai';

import { GameStatsAtom } from '@state/room';

export function GameStats() {
	const gameStats = useAtomValue(GameStatsAtom);

	const getWinRate = () => {
		if (gameStats.totalGames === 0) return 0;
		return Math.round((gameStats.wins / gameStats.totalGames) * 100);
	};

	const getAchievements = () => {
		const achievements = [];

		if (gameStats.wins >= 10)
			achievements.push({
				icon: '🏆',
				text: 'Veteran Player',
				color: 'text-yellow-400',
			});
		if (gameStats.winStreak >= 5)
			achievements.push({
				icon: '🔥',
				text: 'Hot Streak',
				color: 'text-orange-400',
			});
		if (gameStats.totalGames >= 50)
			achievements.push({
				icon: '🎯',
				text: 'Dedicated Player',
				color: 'text-purple-400',
			});

		return achievements;
	};

	return (
		<div className='glass w-full max-w-md rounded-2xl p-6'>
			<div className='mb-6 text-center'>
				<h3 className='mb-2 text-xl font-bold text-slate-200'>
					Game Statistics
				</h3>
				<div className='bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-3xl font-bold text-transparent'>
					{getWinRate()}% Win Rate
				</div>
			</div>

			<div className='mb-6 grid grid-cols-2 gap-4'>
				<div className='text-center'>
					<div className='text-2xl font-bold text-green-400'>
						{gameStats.totalGames}
					</div>
					<div className='text-sm text-slate-300'>Total Games</div>
				</div>
				<div className='text-center'>
					<div className='text-2xl font-bold text-blue-400'>
						{gameStats.wins}
					</div>
					<div className='text-sm text-slate-300'>Wins</div>
				</div>
				<div className='text-center'>
					<div className='text-2xl font-bold text-red-400'>
						{gameStats.losses}
					</div>
					<div className='text-sm text-slate-300'>Losses</div>
				</div>
				<div className='text-center'>
					<div className='text-2xl font-bold text-yellow-400'>
						{gameStats.draws}
					</div>
					<div className='text-sm text-slate-300'>Draws</div>
				</div>
			</div>

			<div className='mb-6 space-y-3'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<TrendingUpIcon className='text-green-400' />
						<span className='text-slate-300'>Current Streak</span>
					</div>
					<span className='font-semibold text-slate-200'>
						{gameStats.winStreak}
					</span>
				</div>

				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<StarIcon className='text-yellow-400' />
						<span className='text-slate-300'>Best Streak</span>
					</div>
					<span className='font-semibold text-slate-200'>
						{gameStats.longestWinStreak}
					</span>
				</div>
			</div>

			{/* Achievements */}
			{getAchievements().length > 0 && (
				<div className='border-t border-slate-600 pt-4'>
					<h4 className='mb-3 text-sm font-semibold text-slate-300'>
						Achievements
					</h4>
					<div className='flex flex-wrap gap-2'>
						{getAchievements().map((achievement, index) => (
							<div
								key={index}
								className={`flex items-center gap-1 rounded-lg border border-slate-600 bg-slate-800 px-2 py-1 ${achievement.color}`}
							>
								<span className='text-sm'>{achievement.icon}</span>
								<span className='text-xs font-medium'>{achievement.text}</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
