import { ContentCopy as CopyIcon } from '@mui/icons-material';
import { useAtomValue } from 'jotai';
import { useState } from 'react';

import { SocketUserIdAtom } from '@state/socket';

import type { IRoomInfo } from '@4dots/shared';

interface WaitingLobbyProps {
	roomInfo: IRoomInfo;
}

export function WaitingLobby(props: WaitingLobbyProps) {
	const { roomInfo } = props;
	const socketUserId = useAtomValue(SocketUserIdAtom);
	const [showToast, setShowToast] = useState(false);

	return (
		<>
			<div className='space-y-4 text-center sm:space-y-6'>
				<h2 className='bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl'>
					Waiting Room
				</h2>
				<div className='px-3 py-2 text-lg font-medium text-slate-200 sm:px-4 sm:py-3 sm:text-xl lg:px-8'>
					{!roomInfo.visitorId
						? '⏳ Waiting for opponent to join...'
						: socketUserId === roomInfo.visitorId
							? '🎮 Waiting for host to start game...'
							: '🎯 Someone joined the room. Ready to start!'}
				</div>
			</div>

			{socketUserId === roomInfo.hostId && (
				<div
					id='share-link-container'
					className='glass w-full max-w-[300px] rounded-xl border border-slate-600 p-4 text-center sm:max-w-[400px] sm:rounded-2xl sm:p-6 lg:max-w-[500px]'
				>
					<p className='mb-3 text-base font-medium text-slate-200 sm:mb-4 sm:text-lg'>
						📋 Share this link with your opponent:
					</p>
					<div className='flex flex-col items-center justify-between gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 font-mono text-xs text-blue-400 sm:flex-row sm:gap-0 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm'>
						<span className='w-full truncate text-center text-xs sm:flex-1 sm:text-left sm:text-sm'>
							{`${window.location.origin}/room/${roomInfo.id}`}
						</span>
						<div className='relative inline-block'>
							<button
								className='transform rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-purple-600 sm:px-4 sm:py-2'
								onClick={() => {
									navigator.clipboard.writeText(
										`${window.location.origin}/room/${roomInfo.id}`,
									);
									setShowToast(true);
									setTimeout(() => setShowToast(false), 2000);
								}}
							>
								<CopyIcon className='mr-1' fontSize='small' />
								Copy
							</button>
							{showToast && (
								<div className='glass animate-bounce-in absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 transform rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-200 shadow-lg sm:px-4 sm:py-2 sm:text-sm'>
									✅ Copied!
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</>
	);
}
