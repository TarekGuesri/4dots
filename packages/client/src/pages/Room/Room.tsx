import { CurrentPlayerType } from '@4dots/shared';
import {
	Close as CloseIcon,
	ContentCopy as CopyIcon,
	Settings as SettingsIcon,
	Timer as TimerIcon,
	VolumeOff as VolumeOffIcon,
	VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import classNames from 'classnames';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useWebSocketContext } from '@atoms/AppProviders/WebSocketProvider';
import { Disk } from '@atoms/Disk/Disk';
import { Button } from '@molecules/Button/Button';
import { PlayerIndicator } from '@molecules/PlayerIndicator/PlayerIndicator';
import { RoomPlayerIndicators } from '@organisms/RoomPlayerIndicators/RoomPlayerIndicators';
import {
	BoardDisksAtom,
	CurrentPlayerAtom,
	GameTimeAtom,
	RoomInfoAtom,
	RoomInfoLoadingAtom,
	useResetRoomState,
	useUpdateGameStats,
	WinnerAtom,
} from '@state/room';
import { SocketUserIdAtom } from '@state/socket';
import { ModalTypeAtom, SoundAtom } from '@state/ui';
import { Board } from '@templates/Board/Board';
import { isBoardFull } from '@utils/helpers';

export function Room() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [hasJoined, setHasJoined] = useState(false);
	const [showToast, setShowToast] = useState(false);
	const [modalMessage, setModalMessage] = useState('');
	const currentPlayer = useAtomValue(CurrentPlayerAtom);
	const roomInfo = useAtomValue(RoomInfoAtom);
	const [soundEnabled, setSoundEnabled] = useAtom(SoundAtom);
	const socketUserId = useAtomValue(SocketUserIdAtom);
	const [isRoomInfoLoading, setIsRoomInfoLoading] =
		useAtom(RoomInfoLoadingAtom);
	const [modalType, setModalType] = useAtom(ModalTypeAtom);
	const winner = useAtomValue(WinnerAtom);
	const boardDisks = useAtomValue(BoardDisksAtom);
	const [gameTime, setGameTime] = useAtom(GameTimeAtom);
	const resetRoomState = useResetRoomState();
	const updateGameStats = useUpdateGameStats();
	const { joinRoom, leaveRoom, startGame, askForRematch } =
		useWebSocketContext();
	const isLeaving = useRef(false);
	const params = useParams();
	const navigate = useNavigate();

	const isStartGameVisible =
		roomInfo && socketUserId === roomInfo.hostId && !roomInfo.hasGameStarted;
	const isRestartGameVisible = winner || isBoardFull(boardDisks);

	// Determine who is 'You' and 'Opponent' for both sides
	const isUserPlayer1 = socketUserId === roomInfo?.player1Id;
	const youColor = isUserPlayer1 ? 'bg-red-500' : 'bg-yellow-500';
	const opponentColor = isUserPlayer1 ? 'bg-yellow-500' : 'bg-red-500';
	const isYouTurn =
		(isUserPlayer1 && currentPlayer === CurrentPlayerType.Player1) ||
		(!isUserPlayer1 && currentPlayer === CurrentPlayerType.Player2);
	const isOpponentTurn = !isYouTurn;

	// Game timer effect
	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (roomInfo?.hasGameStarted && !winner && !isBoardFull(boardDisks)) {
			interval = setInterval(() => {
				setGameTime((prev) => prev + 1);
			}, 1000);
		}
		return () => clearInterval(interval);
	}, [roomInfo?.hasGameStarted, winner, boardDisks]);

	// Update game stats when game ends
	useEffect(() => {
		if (winner || isBoardFull(boardDisks)) {
			if (winner) {
				// Determine if current player won
				const isCurrentPlayerWinner =
					(winner === CurrentPlayerType.Player1 &&
						socketUserId === roomInfo?.player1Id) ||
					(winner === CurrentPlayerType.Player2 &&
						socketUserId === roomInfo?.player2Id);

				updateGameStats(isCurrentPlayerWinner ? 'win' : 'loss');
			} else {
				updateGameStats('draw');
			}
		}
	}, [winner, boardDisks, socketUserId, roomInfo]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

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
		setSoundEnabled((prev) => !prev);
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
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm'>
					<div className='glass animate-bounce-in mx-4 w-full max-w-md rounded-2xl p-6 sm:p-8'>
						<div className='mb-4 flex items-center justify-between sm:mb-6'>
							<h2 className='text-xl font-bold text-slate-200 sm:text-2xl'>
								⚠️ Error
							</h2>
							<button
								onClick={closeModal}
								className='text-slate-400 transition-colors hover:text-slate-200'
							>
								<CloseIcon />
							</button>
						</div>
						<p className='mb-6 text-base leading-relaxed text-slate-300 sm:mb-8 sm:text-lg'>
							{modalMessage}
						</p>
						<div className='flex justify-end gap-3 sm:gap-4'>
							{modalType === 'Error.VisitorLeft' ? (
								<Button variant='danger' onClick={handleLeave}>
									Leave Room
								</Button>
							) : (
								<Button onClick={closeModal}>Close</Button>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Room UI */}
			{roomInfo && (
				<div className='glass animate-slide-in container mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-4 rounded-2xl p-3 shadow-2xl sm:gap-6 sm:rounded-3xl sm:p-6 lg:gap-8 lg:p-8'>
					{!roomInfo.hasGameStarted && (
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
					)}

					{roomInfo.hasGameStarted && (
						<>
							{/* Game Header - Mobile */}
							<div className='mb-3 flex w-full justify-center sm:hidden'>
								<div className='glass flex w-full max-w-xs flex-col items-center rounded-xl p-3'>
									<div className='flex w-full flex-row items-end justify-between gap-4'>
										{/* You  */}
										<div className='flex h-full flex-1 flex-col items-center justify-center'>
											<span className='mb-1 text-xs font-semibold text-slate-300'>
												You
											</span>
											<div className='relative flex items-center justify-center'>
												<Disk color={youColor} width={32} height={32} />
												<div
													className={
														'absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 ' +
														(isYouTurn
															? 'animate-pulse border-white bg-green-400'
															: 'border-slate-300 bg-slate-400')
													}
												></div>
											</div>
										</div>
										{/* Timer/Settings */}
										<div className='flex flex-1 flex-col items-center'>
											<div className='glass flex min-w-[60px] flex-col items-center justify-center rounded-lg p-2 text-center'>
												<TimerIcon className='mb-1 text-base text-purple-400' />
												<div className='text-base font-bold text-slate-200'>
													{formatTime(gameTime)}
												</div>
												<div className='mt-1 flex flex-row justify-center gap-1'>
													<button
														onClick={toggleSound}
														className='rounded-lg p-1 text-slate-300 transition-colors hover:text-white'
														aria-label='Toggle Sound'
													>
														{soundEnabled ? (
															<VolumeUpIcon fontSize='small' />
														) : (
															<VolumeOffIcon fontSize='small' />
														)}
													</button>
													<button
														disabled
														className='cursor-not-allowed rounded-lg p-1 text-slate-300 opacity-50'
														aria-label='Settings'
													>
														<SettingsIcon fontSize='small' />
													</button>
												</div>
											</div>
										</div>
										{/* Opponent */}
										<div className='flex h-full flex-1 flex-col items-center justify-center'>
											<span className='mb-1 text-xs font-semibold text-slate-300'>
												Opponent
											</span>
											<div className='relative flex items-center justify-center'>
												<Disk color={opponentColor} width={32} height={32} />
												<div
													className={
														'absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 ' +
														(isOpponentTurn
															? 'animate-pulse border-white bg-green-400'
															: 'border-slate-300 bg-slate-400')
													}
												></div>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Game Header - Desktop */}
							<div className='hidden w-full flex-row items-center justify-center gap-6 sm:flex lg:gap-8'>
								{/* You */}
								<PlayerIndicator
									player={
										isUserPlayer1
											? CurrentPlayerType.Player1
											: CurrentPlayerType.Player2
									}
									currentPlayer={currentPlayer}
								/>
								{/* Timer/Settings */}
								<div className='flex min-w-[60px] flex-col items-center justify-center gap-2 sm:min-w-[80px] sm:gap-3 lg:min-w-[100px]'>
									<div className='glass rounded-lg p-3 text-center sm:rounded-xl sm:p-4'>
										<div className='mb-1 flex items-center justify-center gap-1 sm:mb-2 sm:gap-2'>
											<TimerIcon className='text-sm text-purple-400 sm:text-base' />
											<div className='text-lg font-bold text-slate-200 sm:text-xl lg:text-2xl'>
												{formatTime(gameTime)}
											</div>
										</div>
										<div className='flex flex-row justify-center gap-2 sm:gap-3'>
											<button
												onClick={toggleSound}
												className='rounded-lg p-1.5 text-slate-300 transition-colors hover:text-white sm:p-2'
												aria-label='Toggle Sound'
											>
												{soundEnabled ? (
													<VolumeUpIcon fontSize='small' />
												) : (
													<VolumeOffIcon fontSize='small' />
												)}
											</button>
											<button
												disabled
												className='cursor-not-allowed rounded-lg p-1.5 text-slate-300 opacity-50 sm:p-2'
												aria-label='Settings'
											>
												<SettingsIcon fontSize='small' />
											</button>
										</div>
									</div>
								</div>
								{/* Opponent  */}
								<PlayerIndicator
									player={
										isUserPlayer1
											? CurrentPlayerType.Player2
											: CurrentPlayerType.Player1
									}
									currentPlayer={currentPlayer}
								/>
							</div>

							<RoomPlayerIndicators />

							{/* Game Board */}
							<div
								id='game-board-container'
								className='w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[500px]'
							>
								<Board />
							</div>
						</>
					)}

					{/* Action Buttons */}
					<div
						className={classNames(
							'flex w-full max-w-[300px] flex-col items-center gap-3 px-8 sm:max-w-[400px] sm:flex-row sm:gap-4 sm:px-10 lg:max-w-[500px] lg:gap-6 lg:px-12',
							isStartGameVisible || isRestartGameVisible
								? 'justify-between'
								: 'justify-center',
						)}
					>
						<Button
							variant='danger'
							onClick={handleLeave}
							className='w-full sm:max-w-[200px]'
						>
							Leave Room
						</Button>
						{isStartGameVisible && (
							<Button
								onClick={() => startGame()}
								disabled={!roomInfo.visitorId}
								className='w-full sm:max-w-[200px]'
							>
								🎮 Start Game
							</Button>
						)}
						{isRestartGameVisible && (
							<Button
								onClick={() => askForRematch()}
								disabled={
									!roomInfo.visitorId ||
									(roomInfo.player1Id === socketUserId &&
										roomInfo.isPlayer1Rematching) ||
									(roomInfo.player2Id === socketUserId &&
										roomInfo.isPlayer2Rematching)
								}
								className='w-full sm:max-w-[200px]'
							>
								{(roomInfo.player1Id === socketUserId &&
									roomInfo.isPlayer1Rematching) ||
								(roomInfo.player2Id === socketUserId &&
									roomInfo.isPlayer2Rematching)
									? '⏳ Waiting...'
									: '🔄 Play Again'}
							</Button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
