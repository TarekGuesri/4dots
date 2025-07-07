import { Help as HelpIcon, PlayArrow as PlayIcon } from '@mui/icons-material';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useWebSocketContext } from '@atoms/AppProviders/WebSocketProvider';
import { Loading } from '@atoms/Loading/Loading';
import { Button } from '@molecules/Button/Button';
import { GameStats } from '@molecules/GameStats/GameStats';
import { RoomInfoAtom } from '@state/room';
import { SocketUserIdAtom } from '@state/socket';
import { ModalTypeAtom } from '@state/ui';

export function Home() {
	const [IsLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const { createRoom } = useWebSocketContext();
	const roomInfo = useAtomValue(RoomInfoAtom);
	const socketUserId = useAtomValue(SocketUserIdAtom);
	const setModalType = useSetAtom(ModalTypeAtom);

	const handleCreateRoom = () => {
		setIsLoading(true);
		createRoom();
	};

	const handleShowRules = () => {
		setModalType('RULES');
	};

	useEffect(() => {
		setModalType(null);

		if (roomInfo && roomInfo.hostId === socketUserId) {
			navigate(`/room/${roomInfo.id}`);
		}
	}, [roomInfo]);

	if (!socketUserId) {
		return <Loading />;
	}

	return (
		<div className='relative flex min-h-screen flex-col items-center justify-center p-4'>
			<div className='animate-slide-in w-full max-w-4xl space-y-8 text-center'>
				<div className='space-y-6'>
					<div className='relative'>
						<h1 className='bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-6xl font-bold text-transparent drop-shadow-lg md:text-7xl'>
							Connect 4
						</h1>
					</div>

					<p className='mx-auto max-w-2xl text-xl leading-relaxed text-slate-200 md:text-2xl'>
						Challenge your friends to a classic game of strategy and skill!
						<br />
						<span className='font-medium text-purple-300'>
							Can you connect 4 and claim victory?
						</span>
					</p>
				</div>

				{/* Game Stats Preview */}
				<div className='flex justify-center'>
					<GameStats />
				</div>

				{/* Action Buttons */}
				<div className='mx-auto flex max-w-md flex-col items-center justify-center gap-4 sm:flex-row'>
					<Button
						disabled={IsLoading}
						onClick={handleCreateRoom}
						className='btn-glow animate-bounce-in w-full px-8 py-4 text-lg font-semibold sm:w-auto'
						style={{ animationDelay: '0.2s' }}
					>
						<PlayIcon className='mr-2' />
						{IsLoading ? 'Creating Room...' : 'Start Game'}
					</Button>

					<Button
						variant='secondary'
						onClick={handleShowRules}
						className='btn-glow animate-bounce-in w-full px-8 py-4 text-lg font-semibold sm:w-auto'
						style={{ animationDelay: '0.4s' }}
					>
						<HelpIcon className='mr-2' />
						How to Play
					</Button>
				</div>
			</div>
		</div>
	);
}
