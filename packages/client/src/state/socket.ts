import { atom } from 'recoil';
import { StateKeys } from '@constants/StateKeys';

// "undefined" means the URL will be computed from the `window.location` object
const URL =
	process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000';
console.log({ URL });

export const SocketUserIdAtom = atom<string | null>({
	key: StateKeys.SocketUserId,
	default: null,
});
