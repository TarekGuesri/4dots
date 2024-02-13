import { atom } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { StateKeys } from '@constants/StateKeys';

const socketUserId = uuidv4();
// "undefined" means the URL will be computed from the `window.location` object
const URL =
	process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000';
console.log({ URL });

export const SocketUserIdAtom = atom<string>({
	key: StateKeys.SocketUserId,
	default: socketUserId,
});
