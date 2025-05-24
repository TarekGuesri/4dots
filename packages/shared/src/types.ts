export type SocketEventType =
	// Socket
	| 'connect'
	| 'disconnect'
	| 'error'
	// Room
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
	// Board
	| 'startGame'
	| 'boardUpdated'
	| 'makeMove';

export type EventErrorsType =
	| 'Error.RoomNotFound'
	| 'Error.RoomFull'
	| 'Error.HostLeft'
	| 'Error.VisitorLeft';
