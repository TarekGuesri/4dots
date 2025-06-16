import { useEffect, useRef, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useNavigate, useParams } from 'react-router-dom';
import { CurrentPlayerType } from '@4dots/shared';
import {
	VolumeUp as VolumeUpIcon,
	VolumeOff as VolumeOffIcon,
	Settings as SettingsIcon,
} from '@mui/icons-material';
import { useWebSocket } from '@hooks/useWebSocket';
import {
	CurrentPlayerAtom,
	RoomInfoAtom,
	RoomInfoLoadingAtom,
	WinnerAtom,
	useResetRoomState,
} from '@state/room';
import { SocketUserIdAtom } from '@state/socket';
import { ModalTypeAtom } from '@state/ui';
import { Board } from '@templates/Board/Board';
import { Button } from '@molecules/Button/Button';
import { PlayerIndicator } from '@molecules/PlayerIndicator/PlayerIndicator';
import { RoomPlayerIndicators } from '@organisms/RoomPlayerIndicators/RoomPlayerIndicators';

export function Room() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [hasJoined, setHasJoined] = useState(false);
	const [modalMessage, setModalMessage] = useState('');
	const [isMuted, setIsMuted] = useState(false);
	const currentPlayer = useAtomValue(CurrentPlayerAtom);
	const roomInfo = useAtomValue(RoomInfoAtom);
	const socketUserId = useAtomValue(SocketUserIdAtom);
	const [isRoomInfoLoading, setIsRoomInfoLoading] =
		useAtom(RoomInfoLoadingAtom);
	const [modalType, setModalType] = useAtom(ModalTypeAtom);
	const winner = useAtomValue(WinnerAtom);
	const resetRoomState = useResetRoomState();
	const { joinRoom, leaveRoom, startGame } = useWebSocket();
	const isLeaving = useRef(false);
	const params = useParams();
	const navigate = useNavigate();

	const isStartGameVisible =
		roomInfo && socketUserId === roomInfo.hostId && !roomInfo.hasGameStarted;
	const isRestartGameVisible =
		roomInfo && socketUserId === roomInfo.hostId && winner;

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

	const toggleSound = () => {
		setIsMuted((prev) => !prev);
		// TODO: trigger sound system (mute/unmute background music or SFX)
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
		return <>Loading...</>;
	}

	console.log({ modalType, isModalOpen });

	return (
		<div className='flex items-center justify-center p-4 w-full'>
			{/* Modal for errors */}
			{isModalOpen && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
					<div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
						<h2 className='text-xl font-bold mb-4'>Error</h2>
						<p className='mb-6 text-gray-700'>{modalMessage}</p>
						<div className='flex justify-end'>
							{modalType === 'Error.VisitorLeft' ? (
								<Button variant='danger' onClick={handleLeave}>
									Leave Room
								</Button>
							) : (
								<button
									onClick={closeModal}
									className='bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors'
								>
									Close
								</button>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Room UI */}
			{roomInfo && (
				<div className='container bg-neutral-900 mx-auto flex flex-col items-center justify-center w-full max-w-2xl gap-6 p-4 sm:p-8 rounded-lg shadow-lg'>
					{!roomInfo.hasGameStarted && (
						<>
							<div className='text-xl text-neutral-200 font-medium py-3 px-4 sm:px-8 text-center'>
								{!roomInfo.visitorId
									? 'Waiting for opponent to join...'
									: socketUserId === roomInfo.visitorId
									? 'Waiting for host to start game...'
									: 'Someone joined the room. Waiting for you to start game...'}
							</div>
							{socketUserId === roomInfo.hostId && (
								<div className='bg-neutral-800 border border-neutral-700 rounded-lg p-4 w-full max-w-md text-center'>
									<p className='text-neutral-200 font-medium mb-3'>
										Share this link with your opponent to join:
									</p>
									<div className='flex items-center justify-between bg-neutral-700 rounded-md px-3 py-2 text-sm text-blue-400 font-mono'>
										<span className='truncate'>
											{`${window.location.origin}/room/${roomInfo.id}`}
										</span>
										<button
											className='ml-4 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors'
											onClick={() => {
												navigator.clipboard.writeText(
													`${window.location.origin}/room/${roomInfo.id}`
												);
											}}
										>
											Copy
										</button>
									</div>
								</div>
							)}
						</>
					)}

					{roomInfo.hasGameStarted && (
						<>
							<div className='flex flex-row gap-4 sm:gap-8 justify-center items-center w-full'>
								<PlayerIndicator
									player={CurrentPlayerType.Player1}
									currentPlayer={currentPlayer}
								/>
								<div className='flex flex-col items-center justify-center min-w-[60px] sm:min-w-[80px] gap-2'>
									<div className='text-lg sm:text-2xl font-bold text-neutral-200'>
										1:00
									</div>
									<div className='flex flex-row gap-2'>
										<button
											onClick={toggleSound}
											className='text-neutral-200 hover:text-white transition-colors'
											aria-label='Toggle Sound'
										>
											{isMuted ? (
												<VolumeOffIcon fontSize='large' />
											) : (
												<VolumeUpIcon fontSize='large' />
											)}
										</button>
										<button
											disabled
											className='text-neutral-200 hover:text-white transition-colors opacity-50'
											aria-label='Toggle Sound'
										>
											<SettingsIcon fontSize='large' />
										</button>
									</div>
								</div>
								<PlayerIndicator
									player={CurrentPlayerType.Player2}
									currentPlayer={currentPlayer}
								/>
							</div>

							<RoomPlayerIndicators />
							<div className='w-full max-w-[360px] sm:max-w-[480px]'>
								<Board />
							</div>
						</>
					)}
					<div
						className={`mt-4 flex flex-col sm:flex-row gap-4 sm:gap-6 ${
							isStartGameVisible || isRestartGameVisible
								? 'justify-between'
								: 'justify-center'
						} items-center w-full max-w-[360px] sm:max-w-[480px]`}
					>
						<Button
							variant='danger'
							onClick={handleLeave}
							className='w-full max-w-[228px]'
						>
							Leave Room
						</Button>
						{isStartGameVisible && (
							<Button
								onClick={() => startGame()}
								disabled={!roomInfo.visitorId}
								className='w-full'
							>
								Start Game
							</Button>
						)}
						{isRestartGameVisible && (
							<Button
								onClick={() => startGame()}
								disabled={!roomInfo.visitorId}
								className='w-full'
							>
								Restart Game
							</Button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
