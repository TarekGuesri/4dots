import type { FC, PropsWithChildren } from 'react';
import { RecoilRoot } from 'recoil';

export const AppProviders: FC<PropsWithChildren> = ({ children }) => {
	return <RecoilRoot>{children}</RecoilRoot>;
};
