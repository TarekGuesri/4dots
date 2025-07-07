import { useAtomValue } from 'jotai';
import {
	TrendingUp as TrendingUpIcon,
	Star as StarIcon,
} from '@mui/icons-material';
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
		<div className='glass rounded-2xl p-6 w-full max-w-md'>
			<div className='text-center mb-6'>
				<h3 className='text-xl font-bold text-slate-200 mb-2'>
					Game Statistics
				</h3>
				<div className='text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent'>
					{getWinRate()}% Win Rate
				</div>
			</div>

			<div className='grid grid-cols-2 gap-4 mb-6'>
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

			<div className='space-y-3 mb-6'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<TrendingUpIcon className='text-green-400' />
						<span className='text-slate-300'>Current Streak</span>
					</div>
					<span className='text-slate-200 font-semibold'>
						{gameStats.winStreak}
					</span>
				</div>

				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<StarIcon className='text-yellow-400' />
						<span className='text-slate-300'>Best Streak</span>
					</div>
					<span className='text-slate-200 font-semibold'>
						{gameStats.longestWinStreak}
					</span>
				</div>
			</div>

			{/* Achievements */}
			{getAchievements().length > 0 && (
				<div className='border-t border-slate-600 pt-4'>
					<h4 className='text-sm font-semibold text-slate-300 mb-3'>
						Achievements
					</h4>
					<div className='flex flex-wrap gap-2'>
						{getAchievements().map((achievement, index) => (
							<div
								key={index}
								className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 border border-slate-600 ${achievement.color}`}
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
