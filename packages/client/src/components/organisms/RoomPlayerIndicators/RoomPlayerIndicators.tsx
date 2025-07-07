import { CurrentPlayerType } from '@4dots/shared';
import classNames from 'classnames';
import { motion, useAnimation } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';

import {
	BoardDisksAtom,
	CurrentPlayerAtom,
	RoomInfoAtom,
	WinnerAtom,
} from '@state/room';
import { SocketUserIdAtom } from '@state/socket';
import { isBoardFull } from '@utils/helpers';

export function RoomPlayerIndicators() {
	const winner = useAtomValue(WinnerAtom);
	const roomInfo = useAtomValue(RoomInfoAtom);
	const socketUserId = useAtomValue(SocketUserIdAtom);
	const currentPlayer = useAtomValue(CurrentPlayerAtom);
	const boardDisks = useAtomValue(BoardDisksAtom);

	const shakeControls = useAnimation();
	const winnerControls = useAnimation();
	const [prevPlayer, setPrevPlayer] = useState<CurrentPlayerType | null>(null);
	const [hasWinnerShown, setHasWinnerShown] = useState(false);

	// Shake on currentPlayer change
	useEffect(() => {
		if (prevPlayer !== null && prevPlayer !== currentPlayer) {
			shakeControls.start({
				x: [0, -4, 4, -4, 4, 0],
				transition: { duration: 0.4 },
			});
		}
		setPrevPlayer(currentPlayer);
	}, [currentPlayer, prevPlayer, shakeControls]);

	// Flash + scale on winner reveal
	useEffect(() => {
		if (winner !== undefined && !hasWinnerShown) {
			setHasWinnerShown(true);
			winnerControls.start({
				scale: [1, 1.2, 1],
				opacity: [0, 1],
				transition: {
					duration: 0.6,
					ease: 'easeOut',
				},
			});
		}
	}, [winner, hasWinnerShown, winnerControls]);

	const isYourTurn =
		(roomInfo?.player1Id === socketUserId &&
			currentPlayer === CurrentPlayerType.Player1) ||
		(roomInfo?.player2Id === socketUserId &&
			currentPlayer === CurrentPlayerType.Player2);

	if (winner === null && isBoardFull(boardDisks)) {
		return (
			<motion.div
				animate={winnerControls}
				initial={{ scale: 1, opacity: 0 }}
				className='glass rounded-lg border-2 border-slate-600 p-3 text-center shadow-lg sm:rounded-xl sm:p-4'
			>
				<div className='text-sm font-semibold text-slate-200 sm:text-base'>
					It&apos;s a draw! 🤝
				</div>
			</motion.div>
		);
	}

	if (winner) {
		const isWinner =
			(winner === CurrentPlayerType.Player1 &&
				roomInfo?.player1Id === socketUserId) ||
			(winner === CurrentPlayerType.Player2 &&
				roomInfo?.player2Id === socketUserId);

		return (
			<motion.div
				animate={winnerControls}
				initial={{ scale: 1, opacity: 0 }}
				className={classNames(
					'glass rounded-lg border-2 p-3 text-center shadow-lg sm:rounded-xl sm:p-4',
					isWinner
						? 'border-green-500 shadow-green-500/25'
						: 'border-red-500 shadow-red-500/25',
				)}
			>
				<div
					className={classNames(
						'text-sm font-semibold sm:text-base',
						isWinner ? 'text-green-400' : 'text-red-400',
					)}
				>
					{isWinner ? 'You won! 🥳' : 'You lost! 😢'}
				</div>
			</motion.div>
		);
	}

	return (
		<motion.div
			animate={shakeControls}
			className={classNames(
				'glass rounded-lg border-2 p-3 text-center shadow-lg transition-all duration-300 sm:rounded-xl sm:p-4',
				isYourTurn
					? 'border-purple-400 shadow-purple-500/25'
					: 'border-slate-600 opacity-70',
			)}
		>
			<div
				className={classNames(
					'text-sm font-semibold sm:text-base',
					isYourTurn ? 'text-slate-300' : 'text-purple-300',
				)}
			>
				{isYourTurn ? 'Your turn' : 'Opponent turn'}
			</div>
		</motion.div>
	);
}
