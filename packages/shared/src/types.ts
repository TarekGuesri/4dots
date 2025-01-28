export type SocketEventType =
	| 'createRoom'
	| 'roomCreated'
	| 'joinRoom'
	| 'roomJoined'
	| 'createRoomError'
	| 'joinRoomError'
	| 'leaveRoom'
	| 'leaveRoomError'
	| 'roomLeft'
	| 'roomDeleted'
	| 'roomUpdated'
	| 'connect'
	| 'disconnect'
	| 'error';

export type EventErrorsType =
	| 'Error.RoomNotFound'
	| 'Error.RoomFull'
	| 'Error.HostLeft';
