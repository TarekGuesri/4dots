import type { FC } from 'react';
import { Suspense, lazy } from 'react';
import { Loading } from '@atoms/Loading/Loading';

// Public
const Home = lazy(() =>
	import('./Home/Home').then((module) => ({ default: module.Home }))
);
const Room = lazy(() =>
	import('./Room/Room').then((module) => ({ default: module.Room }))
);
const NotFound = lazy(() =>
	import('./NotFound/NotFound').then((module) => ({ default: module.NotFound }))
);

// Public
export const HomePage: FC = () => (
	<Suspense fallback={<Loading />}>
		<Home />
	</Suspense>
);
export const RoomPage: FC = () => (
	<Suspense fallback={<Loading />}>
		<Room />
	</Suspense>
);
export const NotFoundPage: FC = () => (
	<Suspense fallback={<Loading />}>
		<NotFound />
	</Suspense>
);
