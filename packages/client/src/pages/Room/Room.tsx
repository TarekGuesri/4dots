import { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { useNavigate, useParams } from 'react-router-dom';
import { useWebsocket } from '@hooks/useWebSocket';
import {
	RoomInfoAtom,
	RoomInfoLoadingAtom,
	useResetRoomState,
} from '@state/room';
import { SocketUserIdAtom } from '@state/socket';

export function Room() {
	const roomInfo = useRecoilValue(RoomInfoAtom);
	const socketUserId = useRecoilValue(SocketUserIdAtom);
	const isRoomInfoLoading = useRecoilValue(RoomInfoLoadingAtom);
	const resetRoomState = useResetRoomState();
	const isLeaving = useRef(false);
	const { joinRoom, leaveRoom } = useWebsocket();
	const params = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		if (!roomInfo) {
			joinRoom(params.roomId ?? '');
		}

		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			resetRoomState();
			if (isLeaving.current) {
				console.log('User is leaving the page');
			}
			event.returnValue = '';
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [roomInfo, params.roomId, joinRoom, resetRoomState]);

	if (isRoomInfoLoading) {
		return <>Loading...</>;
	}

	if (!roomInfo) {
		// cspell:disable-line
		return <>Room doesn&apos;t exist</>;
	}

	return (
		<div>
			<button
				onClick={() => {
					isLeaving.current = true;
					leaveRoom();
					navigate(`/`);
				}}
			>
				Leave
			</button>
			<div>User: {socketUserId}</div>
			<div>Room: {roomInfo.id}</div>
			<div>Player1: {roomInfo.hostId}</div>
			<div>Player2: {roomInfo.visitorId ?? 'None'}</div>
		</div>
	);
}
