import { CurrentPlayerType } from '@4dots/shared';
import { useAtomValue } from 'jotai';
import { CurrentPlayerAtom, RoomInfoAtom, WinnerAtom } from '@state/room';
import { SocketUserIdAtom } from '@state/socket';

export function RoomPlayerIndicators() {
	const winner = useAtomValue(WinnerAtom);
	const roomInfo = useAtomValue(RoomInfoAtom);
	const socketUserId = useAtomValue(SocketUserIdAtom);
	const currentPlayer = useAtomValue(CurrentPlayerAtom);

	if (winner) {
		return (
			<div className='text-neutral-200 bg-teal-900 font-medium rounded-lg py-3 px-8 w-[178px] text-center'>
				{winner === CurrentPlayerType.Player1 ? 'Red Wins' : 'Yellow Wins'}
			</div>
		);
	} else {
		return (
			<div className='text-neutral-200 bg-teal-900 font-medium rounded-lg py-3 px-8 w-[178px] text-center'>
				{(roomInfo?.player1Id === socketUserId &&
					currentPlayer === CurrentPlayerType.Player1) ||
				(roomInfo?.player2Id === socketUserId &&
					currentPlayer === CurrentPlayerType.Player2)
					? 'Your Turn'
					: 'Opponent Turn'}
			</div>
		);
	}
}
