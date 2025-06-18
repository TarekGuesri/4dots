import { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { CurrentPlayerType } from '@4dots/shared';
import { useAtomValue } from 'jotai';
import {
	CurrentPlayerAtom,
	RoomInfoAtom,
	WinnerAtom,
	BoardDisksAtom,
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
				className='text-neutral-200 font-medium rounded-lg py-3 px-8 w-[178px] text-center bg-neutral-700'
			>
				It&apos;s a draw! 🤝
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
				className={`text-neutral-200 font-medium rounded-lg py-3 px-8 w-[178px] text-center ${
					isWinner ? 'bg-blue-700' : 'bg-red-700'
				}`}
			>
				{isWinner ? 'You won! 🥳' : 'You lost! 😢'}
			</motion.div>
		);
	}

	return (
		<motion.div
			animate={shakeControls}
			className='text-neutral-200 bg-teal-900 font-medium rounded-lg py-3 px-8 w-[178px] text-center'
		>
			{isYourTurn ? 'Your turn' : 'Opponent turn'}
		</motion.div>
	);
}
