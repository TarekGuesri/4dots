import { CurrentPlayerType } from '@4dots/shared';
import { useAtom, useAtomValue } from 'jotai';

import { useWebSocketContext } from '@atoms/AppProviders/WebSocketProvider';
import { BOARD_SIZE } from '@constants/BoardSettings';
import { DiskPlace } from '@molecules/DiskPlace/DiskPlace';
import {
	BoardDisksAtom,
	CurrentPlayerAtom,
	RoomInfoAtom,
	WinnerAtom,
} from '@state/room';
import { SocketUserIdAtom } from '@state/socket';
import { checkWinner, isBoardFull } from '@utils/helpers';

import type { BoardDisksType } from '@4dots/shared';

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
	const { makeMove } = useWebSocketContext();

	const isCurrentPlayer =
		(currentPlayer === CurrentPlayerType.Player1 &&
			roomInfo?.player1Id === socketUserId) ||
		(currentPlayer === CurrentPlayerType.Player2 &&
			roomInfo?.player2Id === socketUserId);

	const isColumnFull = boardDisks[0][colId] !== null;
	const canClick =
		!winner && !isColumnFull && isCurrentPlayer && roomInfo?.hasGameStarted;

	const handleClickCol = () => {
		if (!canClick) return;

		const newBoard: BoardDisksType = boardDisks.map((row) => [...row]);
		let socketWinner = null;

		for (let i = BOARD_SIZE.rows - 1; i >= 0; i--) {
			if (!newBoard[i][colId]) {
				newBoard[i][colId] = currentPlayer;

				if (checkWinner(i, colId, currentPlayer, newBoard)) {
					socketWinner = currentPlayer;
					setWinner(currentPlayer);
				} else if (isBoardFull(newBoard)) {
					socketWinner = null;
					setWinner(null);
				} else {
					setCurrentPlayer(
						currentPlayer === CurrentPlayerType.Player1
							? CurrentPlayerType.Player2
							: CurrentPlayerType.Player1,
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
		<div className='flex h-full w-full flex-col' onClick={handleClickCol}>
			{boardDisks.map((_, index) => (
				<DiskPlace key={index} colId={colId} rowId={index} />
			))}
		</div>
	);
}
