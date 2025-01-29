import { useNavigate } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { RoomInfoAtom } from '@state/room';
import { useWebSocket } from '@hooks/useWebSocket';
import { SocketUserIdAtom } from '@state/socket';
import { ModalTypeAtom } from '@state/ui';

export function Home() {
	const [IsLoading, setIsLoading] = useState(false);
	const { createRoom } = useWebSocket();
	const roomInfo = useAtomValue(RoomInfoAtom);
	const socketUserId = useAtomValue(SocketUserIdAtom);
	const setModalType = useSetAtom(ModalTypeAtom);
	const navigate = useNavigate();

	const handleCreateRoom = () => {
		setIsLoading(true);
		createRoom();
	};

	useEffect(() => {
		setModalType(null);

		if (roomInfo && roomInfo.hostId === socketUserId) {
			navigate(`/room/${roomInfo.id}`);
		}
	}, [roomInfo]);

	return (
		<div>
			Home
			<button disabled={IsLoading} onClick={handleCreateRoom}>
				{IsLoading ? 'Loading...' : 'Create Room'}
			</button>
		</div>
	);
}
