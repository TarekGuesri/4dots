import { CurrentPlayerType } from '@4dots/shared';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';

import { useWebSocketContext } from '@atoms/AppProviders/WebSocketProvider';
import { GAME_SETTINGS } from '@constants/GameSettings';
import { usePlaySound } from '@hooks/usePlaySound';
import { GameHeaderDesktop } from '@organisms/Room/GameHeaderDesktop';
import { GameHeaderMobile } from '@organisms/Room/GameHeaderMobile';
import { RoomPlayerIndicators } from '@organisms/RoomPlayerIndicators/RoomPlayerIndicators';
import {
	BoardDisksAtom,
	CurrentPlayerAtom,
	GameTimeAtom,
	WinnerAtom,
} from '@state/room';
import { SocketUserIdAtom } from '@state/socket';
import { SoundAtom } from '@state/ui';
import { Board } from '@templates/Board/Board';
import { isBoardFull } from '@utils/helpers';

import type { IRoomInfo } from '@4dots/shared';

interface RoomLayoutProps {
	roomInfo: IRoomInfo;
}

export function RoomLayout(props: RoomLayoutProps) {
	const { roomInfo } = props;
	const socketUserId = useAtomValue(SocketUserIdAtom);
	const currentPlayer = useAtomValue(CurrentPlayerAtom);
	const [soundEnabled, setSoundEnabled] = useAtom(SoundAtom);
	const setGameTime = useSetAtom(GameTimeAtom);
	const boardDisks = useAtomValue(BoardDisksAtom);
	const winner = useAtomValue(WinnerAtom);
	const { playSound, stopAllSounds } = usePlaySound();
	const { makeMove } = useWebSocketContext();

	// Determine who is 'You' and 'Opponent' for both sides
	const isUserPlayer1 = socketUserId === roomInfo?.player1Id;

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

	// Game timer effect
	useEffect(() => {
		if (roomInfo?.hasGameStarted) {
			setGameTime(GAME_SETTINGS.TURN_TIME_LIMIT_SECONDS);
		}
	}, [roomInfo?.hasGameStarted]);

	return (
		<>
			{/* Game Header - Mobile */}
			<GameHeaderMobile
				isUserPlayer1={isUserPlayer1}
				toggleSound={toggleSound}
			/>

			{/* Game Header - Desktop */}
			<GameHeaderDesktop
				isUserPlayer1={isUserPlayer1}
				toggleSound={toggleSound}
			/>

			<RoomPlayerIndicators />

			{/* Game Board */}
			<div
				id='game-board-container'
				className='w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[500px]'
			>
				<Board />
			</div>
		</>
	);
}
