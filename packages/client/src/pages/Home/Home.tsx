import { useNavigate } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { RoomInfoAtom } from '@state/room';
import { useWebSocketContext } from '@atoms/AppProviders/WebSocketProvider';
import { SocketUserIdAtom } from '@state/socket';
import { ModalTypeAtom } from '@state/ui';
import { Button } from '@molecules/Button/Button';
import { Loading } from '@atoms/Loading/Loading';

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
		<div className='min-h-screen flex flex-col items-center justify-center p-4'>
			<div className='text-center space-y-8 max-w-md'>
				<div className='space-y-4'>
					<h1 className='text-5xl font-bold text-neutral-100'>Connect 4</h1>
					<p className='text-neutral-200 text-lg'>
						Challenge your friends to a classic game of strategy and skill!
					</p>
				</div>

				<div className='flex flex-col space-y-4'>
					<Button
						disabled={IsLoading}
						onClick={handleCreateRoom}
						className='w-full py-4 text-lg'
					>
						{IsLoading ? 'Creating Room...' : 'Create Room'}
					</Button>

					<Button
						variant='secondary'
						onClick={handleShowRules}
						className='w-full py-4 text-lg'
					>
						How to Play
					</Button>
				</div>
			</div>
		</div>
	);
}
