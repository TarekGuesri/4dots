import { atom } from 'jotai';

import type { ModalType } from '@4dots/shared';

export const ModalTypeAtom = atom<ModalType>(null);
export const SoundAtom = atom<boolean>(true);
