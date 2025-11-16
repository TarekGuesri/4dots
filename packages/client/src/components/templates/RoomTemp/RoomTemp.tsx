import { CurrentPlayerType } from '@4dots/shared';
import {
	ContentCopy as CopyIcon,
	Settings as SettingsIcon,
	Timer as TimerIcon,
	VolumeOff as VolumeOffIcon,
	VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import classNames from 'classnames';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';

import { useWebSocketContext } from '@atoms/AppProviders/WebSocketProvider';
import { Disk } from '@atoms/Disk/Disk';
import { GAME_SETTINGS } from '@constants/GameSettings';
import { usePlaySound } from '@hooks/usePlaySound';
import { Button } from '@molecules/Button/Button';
import { PlayerIndicator } from '@molecules/PlayerIndicator/PlayerIndicator';
import { RoomPlayerIndicators } from '@organisms/RoomPlayerIndicators/RoomPlayerIndicators';
import {
	BoardDisksAtom,
	CurrentPlayerAtom,
	GameTimeAtom,
	useUpdateGameStats,
	WinnerAtom,
} from '@state/room';
import { SocketUserIdAtom } from '@state/socket';
import { SoundAtom } from '@state/ui';
import { Board } from '@templates/Board/Board';
import { isBoardFull } from '@utils/helpers';

import type { IRoomInfo } from '@4dots/shared';

interface RoomTempProps {
	roomInfo: IRoomInfo;
	handleLeave: () => void;
}

export function RoomTemp(props: RoomTempProps) {
	const { roomInfo, handleLeave } = props;
	const [soundEnabled, setSoundEnabled] = useAtom(SoundAtom);
	const [showToast, setShowToast] = useState(false);
	const socketUserId = useAtomValue(SocketUserIdAtom);
	const currentPlayer = useAtomValue(CurrentPlayerAtom);
	const winner = useAtomValue(WinnerAtom);
	const boardDisks = useAtomValue(BoardDisksAtom);
	const [gameTime, setGameTime] = useAtom(GameTimeAtom);
	const updateGameStats = useUpdateGameStats();
	const { playSound, stopAllSounds, stopSound } = usePlaySound();
	const { startGame, askForRematch, makeMove } = useWebSocketContext();

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

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const toggleSound = () => {
		if (soundEnabled) {
			stopAllSounds();
		}
		setSoundEnabled((prev) => !prev);
	};

	useEffect(() => {
		let interval: NodeJS.Timeout;

		const isYourTurn =
			(currentPlayer === CurrentPlayerType.Player1 &&
				socketUserId === roomInfo?.player1Id) ||
			(currentPlayer === CurrentPlayerType.Player2 &&
				socketUserId === roomInfo?.player2Id);

		if (
			roomInfo?.hasGameStarted &&
			!winner &&
			!isBoardFull(boardDisks) &&
			isYourTurn
		) {
			interval = setInterval(() => {
				setGameTime((prev) => {
					if (prev > 0) {
						if (prev <= 10) {
							playSound('clock_ticking');
						}
						return prev - 1;
					} else {
						clearInterval(interval);

						// Stop all sounds when time runs out
						stopAllSounds();

						const winningPlayer =
							currentPlayer === CurrentPlayerType.Player1
								? CurrentPlayerType.Player2
								: CurrentPlayerType.Player1;

						makeMove({
							newBoard: boardDisks,
							currentPlayer: winningPlayer,
							winner: winningPlayer,
						});

						return 0;
					}
				});
			}, 1000);
		}

		return () => {
			clearInterval(interval);
		};
	}, [
		roomInfo?.hasGameStarted,
		winner,
		boardDisks,
		currentPlayer,
		socketUserId,
		roomInfo,
		playSound,
		makeMove,
	]);

	// Stop clock_ticking sound when turn changes (move is made)
	const prevIsYourTurnRef = useRef<boolean | null>(null);
	useEffect(() => {
		const isYourTurn =
			(currentPlayer === CurrentPlayerType.Player1 &&
				socketUserId === roomInfo?.player1Id) ||
			(currentPlayer === CurrentPlayerType.Player2 &&
				socketUserId === roomInfo?.player2Id);

		// Only stop the sound if the turn changed from user's turn to not user's turn
		if (
			prevIsYourTurnRef.current === true &&
			!isYourTurn &&
			roomInfo?.hasGameStarted
		) {
			stopSound('clock_ticking');
		}

		// Update the ref for next comparison
		prevIsYourTurnRef.current = isYourTurn;
	}, [boardDisks, currentPlayer, socketUserId, roomInfo, stopSound]);

	// Stop clock_ticking sound when user leaves
	useEffect(() => {
		// If roomInfo is null (room deleted/host left), stop the sound
		if (!roomInfo) {
			stopSound('clock_ticking');
			return;
		}

		// If game has started and visitor left (visitorId becomes null), stop the sound
		if (roomInfo.hasGameStarted && !roomInfo.visitorId) {
			stopSound('clock_ticking');
		}
	}, [roomInfo, stopSound]);

	// Game timer effect
	useEffect(() => {
		if (roomInfo?.hasGameStarted) {
			setGameTime(GAME_SETTINGS.TURN_TIME_LIMIT_SECONDS);
		}
	}, [roomInfo?.hasGameStarted]);

	useEffect(() => {
		if (winner || isBoardFull(boardDisks)) {
			// Stop clock_ticking sound when game ends
			stopSound('clock_ticking');

			if (winner) {
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
	}, [winner, boardDisks, socketUserId, roomInfo, stopSound]);

	return (
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
									<div className='glass flex flex-col items-center justify-center rounded-lg p-2 text-center'>
										<TimerIcon className='mb-1 text-base text-purple-400' />
										<div className='relative w-12 text-center sm:w-14 lg:w-16'>
											<span
												className={classNames(
													'inline-block text-lg font-bold transition-transform duration-300 sm:text-xl lg:text-2xl',
													gameTime <= 10
														? 'scale-125 animate-pulse text-red-500'
														: 'text-slate-200',
												)}
											>
												{formatTime(gameTime)}
											</span>
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
						<div className='flex flex-col items-center justify-center gap-2 sm:gap-3'>
							<div className='glass rounded-lg p-3 text-center sm:rounded-xl sm:p-4'>
								<div className='mb-1 flex items-center justify-center gap-1 sm:mb-2 sm:gap-2'>
									<TimerIcon className='text-sm text-purple-400 sm:text-base' />
									<div className='relative w-12 text-center sm:w-14 lg:w-16'>
										<span
											className={classNames(
												'inline-block text-lg font-bold transition-transform duration-300 sm:text-xl lg:text-2xl',
												gameTime <= 10
													? 'scale-125 animate-pulse text-red-500'
													: 'text-slate-200',
											)}
										>
											{formatTime(gameTime)}
										</span>
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
	);
}
