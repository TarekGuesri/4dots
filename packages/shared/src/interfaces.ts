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

export interface IGameStats {
	totalGames: number;
	wins: number;
	losses: number;
	draws: number;
	winStreak: number;
	longestWinStreak: number;
}

export type GameResultType = 'win' | 'loss' | 'draw';

export interface LoadGameStatsPayload {
	token: string | null;
}

export interface RecordGameResultPayload {
	token: string | null;
	result: GameResultType;
}

export interface GameStatsSyncPayload {
	stats: IGameStats;
	token: string;
}

export enum CurrentPlayerType {
	Player1 = 'Player1',
	Player2 = 'Player2',
}

export type BoardDisksType = Array<Array<CurrentPlayerType | null>>;
