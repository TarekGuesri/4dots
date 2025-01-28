import { atom } from 'recoil';
import type { EventErrorsType } from '@4dots/shared';
import { StateKeys } from '@constants/StateKeys';

export const ModalTypeAtom = atom<EventErrorsType | null>({
	key: StateKeys.ModalType,
	default: null,
});
