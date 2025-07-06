import type { ModalType } from '@4dots/shared';
import { atom } from 'jotai';

export const ModalTypeAtom = atom<ModalType>(null);
export const SoundAtom = atom<boolean>(true);
