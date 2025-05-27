import { useAtom, useAtomValue } from 'jotai';
import type { BoardDisksType } from '@4dots/shared';
import { CurrentPlayerType } from '@4dots/shared';
import {
	BoardDisksAtom,
	CurrentPlayerAtom,
	RoomInfoAtom,
	WinnerAtom,
} from '@state/room';
import { BOARD_SIZE } from '@constants/BoardSettings';
import { DiskPlace } from '@molecules/DiskPlace';
import { checkWinner } from '@utils/helpers';
import { useWebSocket } from '@hooks/useWebSocket';
import { SocketUserIdAtom } from '@state/socket';

interface BoardColProps {
	colId: number;
}

export function BoardCol(props: BoardColProps) {
	const { colId } = props;
	const boardDisks = useAtomValue(BoardDisksAtom);
	const [currentPlayer, setCurrentPlayer] = useAtom(CurrentPlayerAtom);
	const roomInfo = useAtomValue(RoomInfoAtom);
	const [winner, setWinner] = useAtom(WinnerAtom);
	const socketUserId = useAtomValue(SocketUserIdAtom);
	const { makeMove } = useWebSocket();

	const isCurrentPlayer =
		(currentPlayer === CurrentPlayerType.Player1 &&
			roomInfo?.player1Id === socketUserId) ||
		(currentPlayer === CurrentPlayerType.Player2 &&
			roomInfo?.player2Id === socketUserId);

	const handleClickCol = () => {
		if (winner || boardDisks[0][colId]) return;

		if (
			currentPlayer === CurrentPlayerType.Player1 &&
			roomInfo?.player1Id !== socketUserId
		) {
			return;
		}

		if (
			currentPlayer === CurrentPlayerType.Player2 &&
			roomInfo?.player2Id !== socketUserId
		) {
			return;
		}

		const newBoard: BoardDisksType = boardDisks.map((row) => [...row]);
		let socketWinner = null;

		for (let i = BOARD_SIZE.rows - 1; i >= 0; i--) {
			if (!newBoard[i][colId]) {
				newBoard[i][colId] = currentPlayer;

				if (checkWinner(i, colId, currentPlayer, newBoard)) {
					socketWinner = currentPlayer;
					setWinner(currentPlayer);
				} else {
					setCurrentPlayer(
						currentPlayer === CurrentPlayerType.Player1
							? CurrentPlayerType.Player2
							: CurrentPlayerType.Player1
					);
				}

				makeMove({
					newBoard,
					currentPlayer:
						currentPlayer === CurrentPlayerType.Player1
							? CurrentPlayerType.Player2
							: CurrentPlayerType.Player1,
					winner: socketWinner,
				});
				break;
			}
		}
	};

	if (winner) {
		console.log({ winner });
	}

	return (
		<div
			className={`flex-1 flex flex-col ${
				isCurrentPlayer ? 'hover:bg-neutral-600 cursor-pointer' : ''
			}`}
			onClick={handleClickCol}
		>
			{boardDisks.map((_, index) => (
				<DiskPlace key={index} colId={colId} rowId={index} />
			))}
		</div>
	);
}
