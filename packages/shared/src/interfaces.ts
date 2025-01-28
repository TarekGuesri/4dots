import { EventErrorsType } from './types';

export interface ISocketUser {
	id: string;
}

export interface IRoomInfo {
	id: string;
	hostId: string;
	visitorId: string | null;
}

export interface SocketEventErrorPayload {
	type: EventErrorsType;
}
