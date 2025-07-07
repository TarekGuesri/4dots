import { useSetAtom } from 'jotai';
import { Close as CloseIcon, Help as HelpIcon } from '@mui/icons-material';
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
			className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto'
			onClick={handleBackdropClick}
		>
			<div className='glass rounded-2xl p-4 sm:p-6 max-w-lg w-full shadow-2xl my-4 animate-bounce-in max-h-[90vh] overflow-y-auto scrollbar smooth-scroll'>
				<div className='flex justify-between items-center mb-4'>
					<div className='flex items-center gap-2'>
						<HelpIcon className='text-purple-400 text-xl' />
						<h2 className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent'>
							How to Play
						</h2>
					</div>
					<button
						onClick={() => setModalType(null)}
						className='text-slate-400 hover:text-slate-200 p-2 rounded-lg hover:bg-slate-700 transition-colors'
					>
						<CloseIcon />
					</button>
				</div>

				<div className='space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed'>
					<div className='glass rounded-xl p-3 border border-slate-600'>
						<p className='text-slate-200 font-medium'>
							Connect 4 is a two-player strategy game where players take turns
							dropping colored discs into a vertical grid.
						</p>
					</div>

					<div className='space-y-3'>
						<div>
							<h3 className='text-lg sm:text-xl font-bold text-slate-200 mb-2 flex items-center gap-2'>
								<span className='text-xl'>🎯</span>
								Objective
							</h3>
							<div className='glass rounded-xl p-3 border border-slate-600'>
								<p>
									Be the first player to connect four of your discs in a row -
									horizontally, vertically, or diagonally.
								</p>
							</div>
						</div>

						<div>
							<h3 className='text-lg sm:text-xl font-bold text-slate-200 mb-2 flex items-center gap-2'>
								<span className='text-xl'>🎮</span>
								Gameplay
							</h3>
							<div className='glass rounded-xl p-3 border border-slate-600'>
								<ul className='space-y-2'>
									<li className='flex items-start gap-2'>
										<span className='text-purple-400 font-bold'>1.</span>
										<span>
											Players take turns dropping one disc at a time into any
											column
										</span>
									</li>
									<li className='flex items-start gap-2'>
										<span className='text-purple-400 font-bold'>2.</span>
										<span>
											Discs fall to the lowest available position in the chosen
											column
										</span>
									</li>
									<li className='flex items-start gap-2'>
										<span className='text-purple-400 font-bold'>3.</span>
										<span>
											The game ends when a player connects four discs or the
											board is full
										</span>
									</li>
									<li className='flex items-start gap-2'>
										<span className='text-purple-400 font-bold'>4.</span>
										<span>
											If the board fills up without a winner, the game is a draw
										</span>
									</li>
								</ul>
							</div>
						</div>

						<div>
							<h3 className='text-lg sm:text-xl font-bold text-slate-200 mb-2 flex items-center gap-2'>
								<span className='text-xl'>💡</span>
								Pro Tips
							</h3>
							<div className='glass rounded-xl p-3 border border-slate-600'>
								<ul className='space-y-2'>
									<li className='flex items-start gap-2'>
										<span className='text-green-400 font-bold'>⚡</span>
										<span>
											Watch for your opponent&apos;s potential winning moves
										</span>
									</li>
									<li className='flex items-start gap-2'>
										<span className='text-green-400 font-bold'>⚡</span>
										<span>Try to create multiple opportunities to win</span>
									</li>
									<li className='flex items-start gap-2'>
										<span className='text-green-400 font-bold'>⚡</span>
										<span>
											Control the center columns for more strategic options
										</span>
									</li>
									<li className='flex items-start gap-2'>
										<span className='text-green-400 font-bold'>⚡</span>
										<span>
											Plan your moves ahead to block your opponent&apos;s
											strategies
										</span>
									</li>
								</ul>
							</div>
						</div>

						<div className='glass rounded-xl p-3 border border-purple-500/50 bg-purple-500/10'>
							<h4 className='text-base font-bold text-purple-300 mb-2 flex items-center gap-2'>
								<span className='text-lg'>🏆</span>
								Ready to Play?
							</h4>
							<p className='text-slate-200 text-sm'>
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
