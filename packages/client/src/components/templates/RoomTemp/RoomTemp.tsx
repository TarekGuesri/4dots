import { CurrentPlayerType } from '@4dots/shared';
import classNames from 'classnames';
import { useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';

import { useWebSocketContext } from '@atoms/AppProviders/WebSocketProvider';
import { usePlaySound } from '@hooks/usePlaySound';
import { Button } from '@molecules/Button/Button';
import { WaitingLobby } from '@organisms/Room/WaitingLobby';
import {
	BoardDisksAtom,
	CurrentPlayerAtom,
	useUpdateGameStats,
	WinnerAtom,
} from '@state/room';
import { SocketUserIdAtom } from '@state/socket';
import { isBoardFull } from '@utils/helpers';

import { RoomLayout } from './RoomLayout';

import type { IRoomInfo } from '@4dots/shared';

interface RoomTempProps {
	roomInfo: IRoomInfo;
	handleLeave: () => void;
}

export function RoomTemp(props: RoomTempProps) {
	const { roomInfo, handleLeave } = props;
	const socketUserId = useAtomValue(SocketUserIdAtom);
	const currentPlayer = useAtomValue(CurrentPlayerAtom);
	const winner = useAtomValue(WinnerAtom);
	const boardDisks = useAtomValue(BoardDisksAtom);

	const updateGameStats = useUpdateGameStats();
	const { stopSound } = usePlaySound();
	const { startGame, askForRematch } = useWebSocketContext();

	const isStartGameVisible =
		roomInfo && socketUserId === roomInfo.hostId && !roomInfo.hasGameStarted;
	const isRestartGameVisible = winner || isBoardFull(boardDisks);

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
			{!roomInfo.hasGameStarted && <WaitingLobby roomInfo={roomInfo} />}

			{roomInfo.hasGameStarted && <RoomLayout roomInfo={roomInfo} />}

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
