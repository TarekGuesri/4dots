import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useWebSocketContext } from '@atoms/AppProviders/WebSocketProvider';
import {
	RoomInfoAtom,
	RoomInfoLoadingAtom,
	useResetRoomState,
} from '@state/room';
import { ModalTypeAtom } from '@state/ui';
import { RoomModal } from '@templates/RoomTemp/RoomModal';
import { RoomTemp } from '@templates/RoomTemp/RoomTemp';

export function Room() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [hasJoined, setHasJoined] = useState(false);
	const [modalMessage, setModalMessage] = useState('');
	const roomInfo = useAtomValue(RoomInfoAtom);
	const [isRoomInfoLoading, setIsRoomInfoLoading] =
		useAtom(RoomInfoLoadingAtom);
	const [modalType, setModalType] = useAtom(ModalTypeAtom);
	const resetRoomState = useResetRoomState();
	const { joinRoom, leaveRoom } = useWebSocketContext();
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

	const closeModal = () => {
		setIsModalOpen(false);
		handleLeave();
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

			case 'Error.VisitorLeft':
				setModalMessage('The other player has left the room.');
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
			console.log('beforeunload');
			handleLeave();
			event.returnValue = '';
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [roomInfo, params.roomId, hasJoined]);

	if (isRoomInfoLoading || isLeaving.current) {
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<div className='glass rounded-2xl p-8 text-center'>
					<div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-500'></div>
					<p className='text-lg text-slate-200'>Loading game...</p>
				</div>
			</div>
		);
	}

	return (
		<div className='flex min-h-screen w-full items-center justify-center p-2 sm:p-4'>
			{isModalOpen && (
				<RoomModal
					modalMessage={modalMessage}
					modalType={modalType}
					handleLeave={handleLeave}
					closeModal={closeModal}
				/>
			)}

			{/* Room UI */}
			{roomInfo && <RoomTemp roomInfo={roomInfo} handleLeave={handleLeave} />}
		</div>
	);
}
