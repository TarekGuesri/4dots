import { useEffect, useRef, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useNavigate, useParams } from 'react-router-dom';
import { CurrentPlayerType } from '@4dots/shared';
import { useWebSocket } from '@hooks/useWebSocket';
import {
	CurrentPlayerAtom,
	RoomInfoAtom,
	RoomInfoLoadingAtom,
	useResetRoomState,
} from '@state/room';
import { SocketUserIdAtom } from '@state/socket';
import { ModalTypeAtom } from '@state/ui';
import { Board } from '@templates/Board';
import { Button } from '@molecules/Button/Button';
import { PlayerIndicator } from '@molecules/PlayerIndicator/PlayerIndicator';

export function Room() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [hasJoined, setHasJoined] = useState(false);
	const [modalMessage, setModalMessage] = useState('');
	const currentPlayer = useAtomValue(CurrentPlayerAtom);
	const roomInfo = useAtomValue(RoomInfoAtom);
	const socketUserId = useAtomValue(SocketUserIdAtom);
	const [isRoomInfoLoading, setIsRoomInfoLoading] =
		useAtom(RoomInfoLoadingAtom);
	const [modalType, setModalType] = useAtom(ModalTypeAtom);
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

	console.log({ modalType, isModalOpen });

	return (
		<div className='min-h-screen flex items-center justify-center'>
			{/* Modal for errors */}
			{isModalOpen && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4'>
					<div className='bg-white rounded-lg p-6 w-full'>
						<h2 className='text-xl font-bold mb-4'>Error</h2>
						<p className='mb-4'>{modalMessage}</p>
						{modalType === 'Error.VisitorLeft' ? (
							<Button variant='danger' onClick={handleLeave}>
								Leave Room
							</Button>
						) : (
							<button
								onClick={closeModal}
								className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
							>
								Close
							</button>
						)}
					</div>
				</div>
			)}

			{/* Room UI */}

			{roomInfo && (
				<div className='container bg-neutral-900 max-h-[700px] mx-auto flex flex-col items-center justify-center max-w-screen-sm gap-8 px-16 py-8 rounded-lg shadow-lg'>
					{/* <div className='mt-4'>
						<div>User: {socketUserId}</div>
						<div>Room: {roomInfo.id}</div>
						<div>Host: {roomInfo.hostId}</div>
						<div>Visitor: {roomInfo.visitorId}</div>
						<div>Player1: {roomInfo.player1Id}</div>
						<div>Player2: {roomInfo.player2Id ?? 'None'}</div>
					</div> */}
					<div className='flex flex-row gap-8 justify-center items-center w-full'>
						<PlayerIndicator
							player={CurrentPlayerType.Player1}
							currentPlayer={currentPlayer}
						/>
						<div className='text-2xl font-bold mt-8 text-neutral-200'>VS</div>
						<PlayerIndicator
							player={CurrentPlayerType.Player2}
							currentPlayer={currentPlayer}
						/>
					</div>
					<div className='text-neutral-200 bg-teal-900 font-medium rounded-lg py-3 px-8'>
						{(roomInfo?.player1Id === socketUserId &&
							currentPlayer === CurrentPlayerType.Player1) ||
						(roomInfo?.player2Id === socketUserId &&
							currentPlayer === CurrentPlayerType.Player2)
							? 'Your Turn'
							: 'Opponent Turn'}
					</div>
					{roomInfo.hasGameStarted && <Board />}
					<div className='mt-4 flex flex-row gap-2'>
						<Button variant='danger' onClick={handleLeave}>
							Leave Room
						</Button>
						{socketUserId === roomInfo.hostId && (
							<Button
								onClick={() => startGame()}
								disabled={!roomInfo.visitorId}
								className='mx-2'
							>
								Start Game
							</Button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
