import { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { v4 as uuidv4 } from 'uuid';
import type { EventErrorsType, IRoomInfo } from '@4dots/shared';
import { RoomInfoAtom, RoomInfoLoadingAtom } from '@state/room';
import { SocketUserIdAtom } from '@state/socket';
import { socket } from '@src/socket';
import { ModalTypeAtom } from '@state/ui';

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
	}, [roomInfo, socketUserId, setIsRoomInfoLoading]);

	return { createRoom, joinRoom, leaveRoom };
}
