import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { useEffect, useState } from 'react';
import { RoomInfoAtom } from '@state/room';
import { useWebsocket } from '@hooks/useWebSocket';
import { SocketUserIdAtom } from '@state/socket';

export function Home() {
	const [IsLoading, setIsLoading] = useState(false);
	const { createRoom } = useWebsocket();
	const roomInfo = useRecoilValue(RoomInfoAtom);
	const socketUserId = useRecoilValue(SocketUserIdAtom);
	const navigate = useNavigate();

	const handleCreateRoom = () => {
		setIsLoading(true);
		createRoom();
	};

	useEffect(() => {
		if (roomInfo && roomInfo.hostId === socketUserId) {
			console.log('aaaaaaaaaaa');

			console.log({ roomInfo });

			navigate(`/room/${roomInfo.id}`);
		}
	}, [roomInfo]);

	console.log('App Render');

	return (
		<div>
			Home
			<button disabled={IsLoading} onClick={handleCreateRoom}>
				{IsLoading ? 'Loading...' : 'Create Room'}
			</button>
		</div>
	);
}
