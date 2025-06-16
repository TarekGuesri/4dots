import { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { CurrentPlayerType } from '@4dots/shared';
import { useAtomValue } from 'jotai';
import { CurrentPlayerAtom, RoomInfoAtom, WinnerAtom } from '@state/room';
import { SocketUserIdAtom } from '@state/socket';

export function RoomPlayerIndicators() {
	const winner = useAtomValue(WinnerAtom);
	const roomInfo = useAtomValue(RoomInfoAtom);
	const socketUserId = useAtomValue(SocketUserIdAtom);
	const currentPlayer = useAtomValue(CurrentPlayerAtom);

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
		if (winner && !hasWinnerShown) {
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

	if (winner) {
		return (
			<motion.div
				animate={winnerControls}
				initial={{ scale: 1, opacity: 0 }}
				className={`text-neutral-200 font-medium rounded-lg py-3 px-8 w-[178px] text-center ${
					winner === CurrentPlayerType.Player1 &&
					roomInfo?.player1Id === socketUserId
						? 'bg-blue-700'
						: 'bg-red-700'
				}`}
			>
				{winner === CurrentPlayerType.Player1 &&
				roomInfo?.player1Id === socketUserId
					? 'You won! 🥳'
					: 'You lost! 😢'}
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
