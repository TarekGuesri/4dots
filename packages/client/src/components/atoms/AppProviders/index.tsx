import type { FC, PropsWithChildren } from 'react';
import { Provider as JotaiProvider } from 'jotai/react';
import { WebSocketProvider } from './WebSocketProvider';

export const AppProviders: FC<PropsWithChildren> = ({ children }) => {
	return (
		<JotaiProvider>
			<WebSocketProvider>{children}</WebSocketProvider>
		</JotaiProvider>
	);
};
