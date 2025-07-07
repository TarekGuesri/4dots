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
	| 'makeMove'
	| 'askForRematch'
	| 'rematchRequested'
	| 'rematchAccepted';

export type EventErrorsType =
	| 'Error.RoomNotFound'
	| 'Error.RoomFull'
	| 'Error.HostLeft'
	| 'Error.VisitorLeft'
	| 'Error.RoomDeleted';

export type ModalType = EventErrorsType | 'RULES' | null;
