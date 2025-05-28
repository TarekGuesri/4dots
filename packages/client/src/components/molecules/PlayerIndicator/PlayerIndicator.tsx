import { CurrentPlayerType } from '@4dots/shared';
import { Disk } from '@atoms/Disk';

interface PlayerIndicatorProps {
	player: CurrentPlayerType;
	currentPlayer: CurrentPlayerType;
}

export function PlayerIndicator(props: PlayerIndicatorProps) {
	const { currentPlayer, player } = props;

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

	return (
		<div
			className={`w-1/2 text-center py-2 rounded-lg bg-neutral-800 flex flex-col items-center justify-center ${
				isCurrentPlayer() ? 'opacity-100' : 'opacity-50'
			}`}
			style={{
				boxShadow: '0 2px 6px rgba(0, 0, 0, 0.6), 0 4px 8px rgba(0, 0, 0, 0.4)',
			}}
		>
			<div
				className={`mb-2 text-neutral-200 ${
					isCurrentPlayer() ? 'font-bold' : 'font-medium'
				}`}
			>
				{player === CurrentPlayerType.Player1 ? 'Player 1' : 'Player 2'}
			</div>
			<Disk color={getColor()} width={35} height={35} />
		</div>
	);
}
