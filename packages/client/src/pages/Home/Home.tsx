import { useNavigate } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import {
	PlayArrow as PlayIcon,
	Help as HelpIcon,
	Star as StarIcon,
} from '@mui/icons-material';
import { RoomInfoAtom } from '@state/room';
import { useWebSocketContext } from '@atoms/AppProviders/WebSocketProvider';
import { SocketUserIdAtom } from '@state/socket';
import { ModalTypeAtom } from '@state/ui';
import { Button } from '@molecules/Button/Button';
import { Loading } from '@atoms/Loading/Loading';
import { GameStats } from '@molecules/GameStats/GameStats';

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
		<div className='min-h-screen flex flex-col items-center justify-center p-4 relative'>
			<div className='text-center space-y-8 max-w-4xl w-full animate-slide-in'>
				<div className='space-y-6'>
					<div className='relative'>
						<h1 className='text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent animate-pulse-glow'>
							Connect 4
						</h1>
						<div className='absolute -top-2 -right-2'>
							<StarIcon className='text-yellow-400 text-2xl animate-bounce-in' />
						</div>
					</div>

					<p className='text-slate-200 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed'>
						Challenge your friends to a classic game of strategy and skill!
						<br />
						<span className='text-purple-300 font-medium'>
							Can you connect 4 and claim victory?
						</span>
					</p>
				</div>

				{/* Game Stats Preview */}
				<div className='flex justify-center'>
					<GameStats />
				</div>

				{/* Action Buttons */}
				<div className='flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto'>
					<Button
						disabled={IsLoading}
						onClick={handleCreateRoom}
						className='w-full sm:w-auto py-4 px-8 text-lg font-semibold btn-glow animate-bounce-in'
						style={{ animationDelay: '0.2s' }}
					>
						<PlayIcon className='mr-2' />
						{IsLoading ? 'Creating Room...' : 'Start Game'}
					</Button>

					<Button
						variant='secondary'
						onClick={handleShowRules}
						className='w-full sm:w-auto py-4 px-8 text-lg font-semibold btn-glow animate-bounce-in'
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
