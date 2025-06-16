import { useSetAtom } from 'jotai';
import { ModalTypeAtom } from '@state/ui';

export function RulesModal() {
	const setModalType = useSetAtom(ModalTypeAtom);

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			setModalType(null);
		}
	};

	return (
		<div
			className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto'
			onClick={handleBackdropClick}
		>
			<div className='bg-neutral-800 rounded-lg p-4 sm:p-6 max-w-lg w-full shadow-xl my-4'>
				<div className='flex justify-between items-center mb-4 sm:mb-6'>
					<h2 className='text-xl sm:text-2xl font-bold text-neutral-200'>
						How to Play
					</h2>
					<button
						onClick={() => setModalType(null)}
						className='text-neutral-400 hover:text-neutral-200 p-2 -m-2'
					>
						✕
					</button>
				</div>

				<div className='space-y-3 sm:space-y-4 text-neutral-300 text-sm sm:text-base'>
					<p>
						Connect 4 is a two-player strategy game where players take turns
						dropping colored discs into a vertical grid.
					</p>

					<h3 className='text-lg sm:text-xl font-semibold text-neutral-200 mt-4 sm:mt-6'>
						Objective
					</h3>
					<p>
						Be the first player to connect four of your discs in a row -
						horizontally, vertically, or diagonally.
					</p>

					<h3 className='text-lg sm:text-xl font-semibold text-neutral-200 mt-4 sm:mt-6'>
						Gameplay
					</h3>
					<ul className='list-disc list-inside space-y-1 sm:space-y-2'>
						<li>
							Players take turns dropping one disc at a time into any column
						</li>
						<li>
							Discs fall to the lowest available position in the chosen column
						</li>
						<li>
							The game ends when a player connects four discs or the board is
							full
						</li>
						<li>If the board fills up without a winner, the game is a draw</li>
					</ul>

					<h3 className='text-lg sm:text-xl font-semibold text-neutral-200 mt-4 sm:mt-6'>
						Tips
					</h3>
					<ul className='list-disc list-inside space-y-1 sm:space-y-2'>
						<li>Watch for your opponent&apos;s potential winning moves</li>
						<li>Try to create multiple opportunities to win</li>
						<li>Control the center columns for more strategic options</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
