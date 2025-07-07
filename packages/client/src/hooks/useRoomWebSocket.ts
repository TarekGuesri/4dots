import { useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { socket } from '@src/socket';
import { RoomInfoAtom, RoomInfoLoadingAtom } from '@state/room';
import { SocketUserIdAtom } from '@state/socket';
import { ModalTypeAtom } from '@state/ui';

import type {
	EventErrorsType,
	IRoomInfo,
	SocketEventType,
} from '@4dots/shared';

export function useRoomWebSocket() {
	const [roomInfo, setRoomInfo] = useAtom(RoomInfoAtom);
	const [socketUserId] = useAtom(SocketUserIdAtom);
	const setIsRoomInfoLoading = useSetAtom(RoomInfoLoadingAtom);
	const setModalType = useSetAtom(ModalTypeAtom);

	const createRoom = (): IRoomInfo | null => {
		if (!socketUserId) {
			return null;
		}
		const roomId = uuidv4();
		const roomInfo: IRoomInfo = {
			hostId: socketUserId,
			id: roomId,
			visitorId: null,
			player1Id: socketUserId,
			player2Id: null,
			isPlayer1Rematching: false,
			isPlayer2Rematching: false,
			hasGameStarted: false,
		};
		socket.emit<SocketEventType>('createRoom', roomInfo);
		return roomInfo;
	};

	const joinRoom = (roomId: string) => {
		setIsRoomInfoLoading(true);

		if (roomInfo) {
			leaveRoom();
		}

		socket.emit<SocketEventType>('joinRoom', roomId);
	};

	const leaveRoom = () => {
		if (!roomInfo) return;
		setRoomInfo(null);
		socket.emit<SocketEventType>('leaveRoom', roomInfo.id);
	};

	const handleRoomUpdated = (room: IRoomInfo) => {
		// If roomInfo is not set and the user is in the room, we update the roomInfo
		if (
			!roomInfo &&
			(room.hostId === socketUserId || room.visitorId === socketUserId)
		) {
			setRoomInfo(room);
			setIsRoomInfoLoading(false);
			return;
		}

		if (roomInfo?.id !== room.id) {
			return;
		}

		console.log({
			room,
			roomInfo,
			condition:
				room.hasGameStarted &&
				room.visitorId === null &&
				room.hostId === socketUserId,
		});

		// If game has started and the visitor left, we display error
		if (
			room.hasGameStarted &&
			room.visitorId === null &&
			room.hostId === socketUserId
		) {
			setModalType('Error.VisitorLeft');
		}

		// If visitor was cleared (disconnected), clear room state
		if (roomInfo?.visitorId && !room.visitorId) {
			console.log('Visitor disconnected, clearing room state');
			setRoomInfo(null);
			setModalType('Error.VisitorLeft');
			return;
		}

		setRoomInfo(room);
	};

	const handleRoomDeleted = (room: IRoomInfo) => {
		if (roomInfo?.id !== room.id) {
			return;
		}
		console.log('Room deleted, clearing room state');
		setRoomInfo(null);
		setIsRoomInfoLoading(false);

		// Show appropriate error message based on who left
		if (room.hostId !== socketUserId) {
			setModalType('Error.HostLeft');
		} else {
			setModalType('Error.RoomDeleted');
		}
	};

	const handleError = (error: { type: EventErrorsType }) => {
		setModalType(error.type);
		setIsRoomInfoLoading(false);
	};

	useEffect(() => {
		const onCreateRoom = (data: IRoomInfo) => {
			if (!roomInfo && data.hostId === socketUserId) {
				setRoomInfo(data);
				setIsRoomInfoLoading(false);
			}
		};

		const onJoinRoom = (data: IRoomInfo) => {
			setRoomInfo(data);
			setIsRoomInfoLoading(false);
		};

		socket.on<SocketEventType>('createRoom', onCreateRoom);
		socket.on<SocketEventType>('joinRoom', onJoinRoom);
		socket.on<SocketEventType>('roomUpdated', handleRoomUpdated);
		socket.on<SocketEventType>('roomDeleted', handleRoomDeleted);
		socket.on<SocketEventType>('error', handleError);

		return () => {
			socket.off<SocketEventType>('createRoom', onCreateRoom);
			socket.off<SocketEventType>('joinRoom', onJoinRoom);
			socket.off<SocketEventType>('roomUpdated', handleRoomUpdated);
			socket.off<SocketEventType>('roomDeleted', handleRoomDeleted);
			socket.off<SocketEventType>('error', handleError);
		};
	}, [roomInfo, socketUserId]);

	return { createRoom, joinRoom, leaveRoom };
}
