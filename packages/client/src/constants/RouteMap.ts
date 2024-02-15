import { include } from 'named-urls';

export enum AppRoot {
	Public = 'Public',
}

export const RouteMap = {
	[AppRoot.Public]: include('/', {
		index: '',
		room: 'room/:roomId',
	}),
};
