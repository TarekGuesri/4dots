import { useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import type { IRoomInfo, SocketEventType } from '@4dots/shared';
import { socket } from '@src/socket';
import { SocketUserIdAtom } from '@state/socket';
import { RoomInfoAtom, RoomInfoLoadingAtom } from '@state/room';

export function useWebsocket() {
	const [isConnected, setIsConnected] = useState(socket.connected);
	const [roomInfo, setRoomInfo] = useRecoilState(RoomInfoAtom);
	const [socketUserId, setSocketUserId] = useRecoilState(SocketUserIdAtom);
	const setIsRoomInfoLoading = useSetRecoilState(RoomInfoLoadingAtom);
	const [errorShown, setErrorShown] = useState(false);
	const navigate = useNavigate();

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
		socket.emit('joinRoom', roomId);
	};

	const leaveRoom = () => {
		if (!roomInfo) return;

		socket.emit('leaveRoom', roomInfo.id);
		setRoomInfo(null);
	};

	const handleError = (error: { message: string }) => {
		if (errorShown) return;
		console.log({ error });

		setErrorShown(true);
		alert(error.message);
		setIsRoomInfoLoading(false);
		navigate('/');
	};

	const handleRoomUpdated = (room: IRoomInfo) => {
		if (roomInfo?.id === room.id) {
			return;
		}

		// if (room.visitorId === null) {
		// 	setRoomInfo(room);
		// }
	};

	const handleRoomDeleted = (room: IRoomInfo) => {
		if (roomInfo?.id === room.id) {
			return;
		}

		setRoomInfo(null);
		setErrorShown(true);
		alert('Host has left');
		navigate('/');
	};

	useEffect(() => {
		const onCreateRoom = (data: IRoomInfo) => {
			console.log('Room Created:', data);
			if (!roomInfo && data.hostId === socketUserId) {
				setRoomInfo(data);
				setIsRoomInfoLoading(false);
			}
		};

		const onJoinRoom = (data: IRoomInfo) => {
			console.log('Joined Room:', data);
			setRoomInfo(data);
			setIsRoomInfoLoading(false);
		};

		const onConnect = () => {
			if (isConnected || socketUserId) {
				return;
			}

			socket.emit('events', { test: 'test' });
			if (!isConnected) {
				setSocketUserId(socket.id ?? null);
				const user = { id: socket.id };

				socket.emit('identity', user, (response: unknown) => {
					console.log('Identity:', response);
					setIsRoomInfoLoading(false);
				});
			}

			setIsConnected(true);
		};

		const onDisconnect = () => {
			console.log('disconnected');
			setIsConnected(false);

			window.addEventListener('beforeunload', (ev) => {
				ev.preventDefault();
				socket.emit('disconnected', { test: 'aaa' });
				console.log('onDisconnect');
			});
		};

		socket.on<SocketEventType>('createRoom', onCreateRoom);
		socket.on<SocketEventType>('joinRoom', onJoinRoom);
		socket.on<SocketEventType>('roomUpdated', handleRoomUpdated);
		socket.on<SocketEventType>('roomDeleted', handleRoomDeleted);
		socket.on<SocketEventType>('error', handleError);
		socket.on<SocketEventType>('connect', onConnect);
		socket.on<SocketEventType>('disconnect', onDisconnect);

		return () => {
			socket.off<SocketEventType>('connect', onConnect);
			socket.off<SocketEventType>('disconnect', onDisconnect);
			socket.off<SocketEventType>('createRoom', onCreateRoom);
			socket.off<SocketEventType>('joinRoom', onJoinRoom);
			socket.off<SocketEventType>('roomUpdated', handleRoomUpdated);
			socket.off<SocketEventType>('roomDeleted', handleRoomDeleted);
			socket.off<SocketEventType>('error', handleError);
		};
	}, [roomInfo, isConnected, socketUserId, navigate, errorShown]);

	return { createRoom, joinRoom, leaveRoom };
}
