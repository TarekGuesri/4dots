import type { BoardDisksType, CurrentPlayerType } from '@4dots/shared';
import { BOARD_SIZE } from '@constants/BoardSettings';

export const checkWinner = (
	row: number,
	col: number,
	currentPlayer: CurrentPlayerType,
	boardDisks: BoardDisksType
): boolean => {
	const directions = [
		[0, 1], // Horizontal
		[1, 0], // Vertical
		[1, 1], // Diagonal \
		[1, -1], // Diagonal /
	];

	for (const [dx, dy] of directions) {
		let count = 1;

		// Check in one direction
		for (let i = 1; i < 4; i++) {
			const newRow = row + i * dx;
			const newCol = col + i * dy;

			if (
				newRow >= 0 &&
				newRow < BOARD_SIZE.rows &&
				newCol >= 0 &&
				newCol < BOARD_SIZE.columns &&
				boardDisks[newRow][newCol] === currentPlayer
			) {
				count++;
			} else {
				break;
			}
		}

		// Check in the opposite direction
		for (let i = 1; i < 4; i++) {
			const newRow = row - i * dx;
			const newCol = col - i * dy;

			if (
				newRow >= 0 &&
				newRow < BOARD_SIZE.rows &&
				newCol >= 0 &&
				newCol < BOARD_SIZE.columns &&
				boardDisks[newRow][newCol] === currentPlayer
			) {
				count++;
			} else {
				break;
			}
		}

		if (count >= 4) {
			return true;
		}
	}

	return false;
};

export const isBoardFull = (board: BoardDisksType): boolean => {
	return board.every((row: Array<CurrentPlayerType | null>) =>
		row.every((cell: CurrentPlayerType | null) => cell !== null)
	);
};
