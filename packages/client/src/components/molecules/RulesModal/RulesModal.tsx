import { Close as CloseIcon, Help as HelpIcon } from '@mui/icons-material';
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
			className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm'
			onClick={handleBackdropClick}
		>
			<div className='glass animate-bounce-in scrollbar smooth-scroll my-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-4 shadow-2xl sm:p-6'>
				<div className='mb-4 flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<HelpIcon className='text-xl text-purple-400' />
						<h2 className='bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-xl font-bold text-transparent sm:text-2xl'>
							How to Play
						</h2>
					</div>
					<button
						onClick={() => setModalType(null)}
						className='rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200'
					>
						<CloseIcon />
					</button>
				</div>

				<div className='space-y-4 text-sm leading-relaxed text-slate-300 sm:text-base'>
					<div className='glass rounded-xl border border-slate-600 p-3'>
						<p className='font-medium text-slate-200'>
							Connect 4 is a two-player strategy game where players take turns
							dropping colored discs into a vertical grid.
						</p>
					</div>

					<div className='space-y-3'>
						<div>
							<h3 className='mb-2 flex items-center gap-2 text-lg font-bold text-slate-200 sm:text-xl'>
								<span className='text-xl'>🎯</span>
								Objective
							</h3>
							<div className='glass rounded-xl border border-slate-600 p-3'>
								<p>
									Be the first player to connect four of your discs in a row -
									horizontally, vertically, or diagonally.
								</p>
							</div>
						</div>

						<div>
							<h3 className='mb-2 flex items-center gap-2 text-lg font-bold text-slate-200 sm:text-xl'>
								<span className='text-xl'>🎮</span>
								Gameplay
							</h3>
							<div className='glass rounded-xl border border-slate-600 p-3'>
								<ul className='space-y-2'>
									<li className='flex items-start gap-2'>
										<span className='font-bold text-purple-400'>1.</span>
										<span>
											Players take turns dropping one disc at a time into any
											column
										</span>
									</li>
									<li className='flex items-start gap-2'>
										<span className='font-bold text-purple-400'>2.</span>
										<span>
											Discs fall to the lowest available position in the chosen
											column
										</span>
									</li>
									<li className='flex items-start gap-2'>
										<span className='font-bold text-purple-400'>3.</span>
										<span>
											The game ends when a player connects four discs or the
											board is full
										</span>
									</li>
									<li className='flex items-start gap-2'>
										<span className='font-bold text-purple-400'>4.</span>
										<span>
											If the board fills up without a winner, the game is a draw
										</span>
									</li>
								</ul>
							</div>
						</div>

						<div>
							<h3 className='mb-2 flex items-center gap-2 text-lg font-bold text-slate-200 sm:text-xl'>
								<span className='text-xl'>💡</span>
								Pro Tips
							</h3>
							<div className='glass rounded-xl border border-slate-600 p-3'>
								<ul className='space-y-2'>
									<li className='flex items-start gap-2'>
										<span className='font-bold text-green-400'>⚡</span>
										<span>
											Watch for your opponent&apos;s potential winning moves
										</span>
									</li>
									<li className='flex items-start gap-2'>
										<span className='font-bold text-green-400'>⚡</span>
										<span>Try to create multiple opportunities to win</span>
									</li>
									<li className='flex items-start gap-2'>
										<span className='font-bold text-green-400'>⚡</span>
										<span>
											Control the center columns for more strategic options
										</span>
									</li>
									<li className='flex items-start gap-2'>
										<span className='font-bold text-green-400'>⚡</span>
										<span>
											Plan your moves ahead to block your opponent&apos;s
											strategies
										</span>
									</li>
								</ul>
							</div>
						</div>

						<div className='glass rounded-xl border border-purple-500/50 bg-purple-500/10 p-3'>
							<h4 className='mb-2 flex items-center gap-2 text-base font-bold text-purple-300'>
								<span className='text-lg'>🏆</span>
								Ready to Play?
							</h4>
							<p className='text-sm text-slate-200'>
								Now that you know the rules, challenge your friends and see who
								can become the Connect 4 champion!
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
