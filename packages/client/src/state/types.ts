export enum CurrentPlayerType {
	Player1 = 'Player1',
	Player2 = 'Player2',
}

export type BoardDisksType = Array<Array<CurrentPlayerType | null>>;
