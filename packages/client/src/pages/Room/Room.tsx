import { useEffect, useRef, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useNavigate, useParams } from 'react-router-dom';
import { CurrentPlayerType } from '@4dots/shared';
import {
	VolumeUp as VolumeUpIcon,
	VolumeOff as VolumeOffIcon,
	Settings as SettingsIcon,
	Close as CloseIcon,
	ContentCopy as CopyIcon,
	Timer as TimerIcon,
} from '@mui/icons-material';
import classNames from 'classnames';
import { useWebSocketContext } from '@atoms/AppProviders/WebSocketProvider';
import {
	BoardDisksAtom,
	CurrentPlayerAtom,
	RoomInfoAtom,
	RoomInfoLoadingAtom,
	WinnerAtom,
	GameTimeAtom,
	useResetRoomState,
	useUpdateGameStats,
} from '@state/room';
import { SocketUserIdAtom } from '@state/socket';
import { ModalTypeAtom, SoundAtom } from '@state/ui';
import { Board } from '@templates/Board/Board';
import { Button } from '@molecules/Button/Button';
import { PlayerIndicator } from '@molecules/PlayerIndicator/PlayerIndicator';
import { RoomPlayerIndicators } from '@organisms/RoomPlayerIndicators/RoomPlayerIndicators';
import { isBoardFull } from '@utils/helpers';
import { Disk } from '@atoms/Disk/Disk';

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
	}, [roomInfo?.hasGameStarted, winner, boardDisks, setGameTime]);

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
	}, [winner, boardDisks, updateGameStats, socketUserId, roomInfo]);

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
			<div className='flex items-center justify-center min-h-screen'>
				<div className='glass rounded-2xl p-8 text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4'></div>
					<p className='text-slate-200 text-lg'>Loading game...</p>
				</div>
			</div>
		);
	}

	return (
		<div className='flex items-center justify-center p-2 sm:p-4 w-full min-h-screen'>
			{isModalOpen && (
				<div className='fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
					<div className='glass rounded-2xl p-6 sm:p-8 w-full max-w-md mx-4 animate-bounce-in'>
						<div className='flex items-center justify-between mb-4 sm:mb-6'>
							<h2 className='text-xl sm:text-2xl font-bold text-slate-200'>
								⚠️ Error
							</h2>
							<button
								onClick={closeModal}
								className='text-slate-400 hover:text-slate-200 transition-colors'
							>
								<CloseIcon />
							</button>
						</div>
						<p className='mb-6 sm:mb-8 text-slate-300 text-base sm:text-lg leading-relaxed'>
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
				<div className='container glass mx-auto flex flex-col items-center justify-center w-full max-w-4xl gap-4 sm:gap-6 lg:gap-8 p-3 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-2xl animate-slide-in'>
					{!roomInfo.hasGameStarted && (
						<>
							<div className='text-center space-y-4 sm:space-y-6'>
								<h2 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent'>
									Waiting Room
								</h2>
								<div className='text-lg sm:text-xl text-slate-200 font-medium py-2 sm:py-3 px-3 sm:px-4 lg:px-8'>
									{!roomInfo.visitorId
										? '⏳ Waiting for opponent to join...'
										: socketUserId === roomInfo.visitorId
										? '🎮 Waiting for host to start game...'
										: '🎯 Someone joined the room. Ready to start!'}
								</div>
							</div>

							{socketUserId === roomInfo.hostId && (
								<div className='glass rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md text-center border border-slate-600'>
									<p className='text-slate-200 font-medium mb-3 sm:mb-4 text-base sm:text-lg'>
										📋 Share this link with your opponent:
									</p>
									<div className='flex flex-col sm:flex-row items-center justify-between bg-slate-800 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-blue-400 font-mono border border-slate-600 gap-2 sm:gap-0'>
										<span className='truncate flex-1 text-center sm:text-left'>
											{`${window.location.origin}/room/${roomInfo.id}`}
										</span>
										<div className='relative inline-block'>
											<button
												className='px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg transition-all duration-300 transform hover:scale-105'
												onClick={() => {
													navigator.clipboard.writeText(
														`${window.location.origin}/room/${roomInfo.id}`
													);
													setShowToast(true);
													setTimeout(() => setShowToast(false), 2000);
												}}
											>
												<CopyIcon className='mr-1' fontSize='small' />
												Copy
											</button>
											{showToast && (
												<div className='absolute top-full left-1/2 transform -translate-x-1/2 mt-2 glass text-slate-200 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-slate-600 shadow-lg z-50 animate-bounce-in'>
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
							<div className='sm:hidden w-full flex justify-center mb-3'>
								<div className='glass rounded-xl p-3 w-full max-w-xs flex flex-col items-center'>
									<div className='flex flex-row items-end justify-between w-full gap-4'>
										{/* You  */}
										<div className='flex flex-col items-center justify-center flex-1 h-full'>
											<span className='text-xs text-slate-300 font-semibold mb-1'>
												You
											</span>
											<div className='relative flex items-center justify-center'>
												<Disk color={youColor} width={32} height={32} />
												<div
													className={
														'absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 ' +
														(isYouTurn
															? 'bg-green-400 border-white animate-pulse'
															: 'bg-slate-400 border-slate-300')
													}
												></div>
											</div>
										</div>
										{/* Timer/Settings */}
										<div className='flex flex-col items-center flex-1'>
											<div className='glass rounded-lg p-2 text-center flex flex-col items-center justify-center min-w-[60px]'>
												<TimerIcon className='text-purple-400 text-base mb-1' />
												<div className='text-base font-bold text-slate-200'>
													{formatTime(gameTime)}
												</div>
												<div className='flex flex-row gap-1 justify-center mt-1'>
													<button
														onClick={toggleSound}
														className='text-slate-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700'
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
														className='text-slate-300 opacity-50 p-1 rounded-lg'
														aria-label='Settings'
													>
														<SettingsIcon fontSize='small' />
													</button>
												</div>
											</div>
										</div>
										{/* Opponent */}
										<div className='flex flex-col items-center justify-center flex-1 h-full'>
											<span className='text-xs text-slate-300 font-semibold mb-1'>
												Opponent
											</span>
											<div className='relative flex items-center justify-center'>
												<Disk color={opponentColor} width={32} height={32} />
												<div
													className={
														'absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 ' +
														(isOpponentTurn
															? 'bg-green-400 border-white animate-pulse'
															: 'bg-slate-400 border-slate-300')
													}
												></div>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Game Header - Desktop */}
							<div className='hidden sm:flex flex-row gap-6 lg:gap-8 justify-center items-center w-full'>
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
								<div className='flex flex-col items-center justify-center min-w-[60px] sm:min-w-[80px] lg:min-w-[100px] gap-2 sm:gap-3'>
									<div className='glass rounded-lg sm:rounded-xl p-3 sm:p-4 text-center'>
										<div className='flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2'>
											<TimerIcon className='text-purple-400 text-sm sm:text-base' />
											<div className='text-lg sm:text-xl lg:text-2xl font-bold text-slate-200'>
												{formatTime(gameTime)}
											</div>
										</div>
										<div className='flex flex-row gap-2 sm:gap-3 justify-center'>
											<button
												onClick={toggleSound}
												className='text-slate-300 hover:text-white transition-colors p-1.5 sm:p-2 rounded-lg hover:bg-slate-700'
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
												className='text-slate-300 opacity-50 p-1.5 sm:p-2 rounded-lg'
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
							<div className='w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[500px]'>
								<Board />
							</div>
						</>
					)}

					{/* Action Buttons */}
					<div
						className={classNames(
							'flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 items-center w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[500px]',
							isStartGameVisible || isRestartGameVisible
								? 'justify-between'
								: 'justify-center'
						)}
					>
						<Button
							variant='danger'
							onClick={handleLeave}
							className='w-full max-w-[180px] sm:max-w-[200px]'
						>
							Leave Room
						</Button>
						{isStartGameVisible && (
							<Button
								onClick={() => startGame()}
								disabled={!roomInfo.visitorId}
								className='w-full max-w-[180px] sm:max-w-[200px]'
							>
								🎮 Start Game
							</Button>
						)}
						{isRestartGameVisible && (
							<Button
								onClick={() => askForRematch()}
								disabled={!roomInfo.visitorId}
								className='w-full max-w-[180px] sm:max-w-[200px]'
							>
								{(roomInfo.player1Id === socketUserId &&
									roomInfo.isPlayer1Rematching) ||
								(roomInfo.player2Id === socketUserId &&
									roomInfo.isPlayer2Rematching)
									? '⏳ Waiting for opponent...'
									: '🔄 Play Again'}
							</Button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
