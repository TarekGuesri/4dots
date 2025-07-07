import { Provider as JotaiProvider } from 'jotai/react';

import { WebSocketProvider } from './WebSocketProvider';

import type { FC, PropsWithChildren } from 'react';

export const AppProviders: FC<PropsWithChildren> = ({ children }) => {
	return (
		<JotaiProvider>
			<WebSocketProvider>{children}</WebSocketProvider>
		</JotaiProvider>
	);
};
