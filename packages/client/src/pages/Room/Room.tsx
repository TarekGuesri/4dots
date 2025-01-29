import { useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useNavigate, useParams } from 'react-router-dom';
import { useWebSocket } from '@hooks/useWebSocket';
import {
	HasGameStartedAtom,
	RoomInfoAtom,
	RoomInfoLoadingAtom,
	useResetRoomState,
} from '@state/room';
import { SocketUserIdAtom } from '@state/socket';
import { ModalTypeAtom } from '@state/ui';
import { Board } from '@templates/Board';

export function Room() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [hasJoined, setHasJoined] = useState(false);
	const [modalMessage, setModalMessage] = useState('');
	const roomInfo = useRecoilValue(RoomInfoAtom);
	const socketUserId = useRecoilValue(SocketUserIdAtom);
	const [isRoomInfoLoading, setIsRoomInfoLoading] =
		useRecoilState(RoomInfoLoadingAtom);
	const hasGameStarted = useRecoilValue(HasGameStartedAtom);
	const [modalType, setModalType] = useRecoilState(ModalTypeAtom);
	const resetRoomState = useResetRoomState();
	const { joinRoom, leaveRoom, startGame } = useWebSocket();
	const isLeaving = useRef(false);
	const params = useParams();
	const navigate = useNavigate();

	const handleLeave = () => {
		leaveRoom();

		if (!isLeaving.current && roomInfo) {
			isLeaving.current = true;
		}

		setIsRoomInfoLoading(true);
		setModalType(null);
		resetRoomState();
		navigate('/');
	};

	// Handle modal based on error type
	useEffect(() => {
		if (!modalType) {
			return;
		}

		switch (modalType) {
			case 'Error.RoomNotFound':
				setModalMessage("Room doesn't exist or cannot be joined.");
				setIsModalOpen(true);
				break;

			case 'Error.RoomFull':
				setModalMessage('The room is already full.');
				setIsModalOpen(true);
				break;

			case 'Error.HostLeft':
				setModalMessage('The host has left the room.');
				setIsModalOpen(true);
				break;

			default:
				setModalMessage('Something unexpected happened');
				setIsModalOpen(true);
				break;
		}
	}, [modalType]);

	useEffect(() => {
		if (!roomInfo && !hasJoined) {
			setHasJoined(true);
			joinRoom(params.roomId ?? '');
		}

		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			handleLeave();
			event.returnValue = '';
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [roomInfo, params.roomId]);

	const closeModal = () => {
		setIsModalOpen(false);
		navigate('/');
	};

	if (isRoomInfoLoading || isLeaving.current) {
		return <>Loading...</>;
	}

	return (
		<div>
			{/* Modal for errors */}
			{isModalOpen && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4'>
					<div className='bg-white rounded-lg p-6 max-w-sm w-full'>
						<h2 className='text-xl font-bold mb-4'>Error</h2>
						<p className='mb-4'>{modalMessage}</p>
						<button
							onClick={closeModal}
							className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
						>
							Close
						</button>
					</div>
				</div>
			)}

			{/* Room UI */}

			{roomInfo && (
				<>
					<button
						onClick={handleLeave}
						className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
					>
						Leave Room
					</button>
					<button
						onClick={() => startGame(roomInfo.id)}
						disabled={!roomInfo.visitorId}
						className={`bg-blue-500 text-white px-4 py-2 rounded ${
							roomInfo.visitorId ? 'hover:bg-blue-600' : ''
						} ${!roomInfo.visitorId ? 'disabled:opacity-50' : ''}`}
					>
						Start Game
					</button>
					<div className='mt-4'>
						<div>User: {socketUserId}</div>
						<div>Room: {roomInfo.id}</div>
						<div>Player1: {roomInfo.hostId}</div>
						<div>Player2: {roomInfo.visitorId ?? 'None'}</div>
					</div>
					{hasGameStarted && <Board />}
				</>
			)}
		</div>
	);
}
