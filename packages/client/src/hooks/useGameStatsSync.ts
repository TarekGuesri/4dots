import { useSetAtom } from 'jotai';
import { useCallback, useEffect } from 'react';

import { socket } from '@src/socket';
import { GameStatsAtom } from '@state/room';
import {
	getStoredGameStatsToken,
	setStoredGameStatsToken,
} from '@utils/gameStatsStorage';

import type {
	GameResultType,
	GameStatsSyncPayload,
	SocketEventType,
} from '@4dots/shared';


export function useGameStatsSync() {
	const setGameStats = useSetAtom(GameStatsAtom);

	const recordGameResult = useCallback((result: GameResultType) => {
		socket.emit<SocketEventType>('recordGameResult', {
			token: getStoredGameStatsToken(),
			result,
		});
	}, []);

	useEffect(() => {
		const onSynced = (payload: GameStatsSyncPayload) => {
			setStoredGameStatsToken(payload.token);
			setGameStats(payload.stats);
		};

		const loadGameStats = () => {
			socket.emit<SocketEventType>('loadGameStats', {
				token: getStoredGameStatsToken(),
			});
		};

		socket.on('gameStatsSynced', onSynced);
		socket.on('connect', loadGameStats);

		// Load immediately if the socket connected before this effect ran.
		if (socket.connected) loadGameStats();

		return () => {
			socket.off('gameStatsSynced', onSynced);
			socket.off('connect', loadGameStats);
		};
	}, [setGameStats]);

	return { recordGameResult };
}
