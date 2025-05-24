import type { FC, PropsWithChildren } from 'react';
import { Provider as JotaiProvider } from 'jotai/react';

export const AppProviders: FC<PropsWithChildren> = ({ children }) => {
	return <JotaiProvider>{children}</JotaiProvider>;
};
