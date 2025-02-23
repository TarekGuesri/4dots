import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { EventErrorsType, IRoomInfo } from '@4dots/shared';
import { useAtom, useSetAtom } from 'jotai';
import { SocketUserIdAtom } from '@state/socket';
import { socket } from '@src/socket';
import { ModalTypeAtom } from '@state/ui';
import { RoomInfoAtom, RoomInfoLoadingAtom } from '@state/room';

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
			hasGameStarted: false,
		};
		socket.emit('createRoom', roomInfo);
		return roomInfo;
	};

	const joinRoom = (roomId: string) => {
		setIsRoomInfoLoading(true);

		if (roomInfo) {
			leaveRoom();
		}

		socket.emit('joinRoom', roomId);
	};

	const leaveRoom = () => {
		if (!roomInfo) return;
		setRoomInfo(null);
		socket.emit('leaveRoom', roomInfo.id);
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

		setRoomInfo(room);
	};

	const handleRoomDeleted = (room: IRoomInfo) => {
		if (roomInfo?.id !== room.id) {
			return;
		}
		setRoomInfo(null);
		if (room.hostId !== socketUserId) {
			setModalType('Error.HostLeft');
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

		socket.on('createRoom', onCreateRoom);
		socket.on('joinRoom', onJoinRoom);
		socket.on('roomUpdated', handleRoomUpdated);
		socket.on('roomDeleted', handleRoomDeleted);
		socket.on('error', handleError);

		return () => {
			socket.off('createRoom', onCreateRoom);
			socket.off('joinRoom', onJoinRoom);
			socket.off('roomUpdated', handleRoomUpdated);
			socket.off('roomDeleted', handleRoomDeleted);
			socket.off('error', handleError);
		};
	}, [roomInfo, socketUserId]);

	return { createRoom, joinRoom, leaveRoom };
}
