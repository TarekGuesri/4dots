import { EventErrorsType } from './types';

export interface ISocketUser {
	id: string;
}

export interface IRoomInfo {
	id: string;
	hostId: string;
	visitorId: string | null;
	player1Id: string;
	player2Id: string | null;
	isPlayer1Rematching: boolean;
	isPlayer2Rematching: boolean;
	hasGameStarted: boolean;
}

export interface SocketEventErrorPayload {
	type: EventErrorsType;
}

export enum CurrentPlayerType {
	Player1 = 'Player1',
	Player2 = 'Player2',
}

export type BoardDisksType = Array<Array<CurrentPlayerType | null>>;
