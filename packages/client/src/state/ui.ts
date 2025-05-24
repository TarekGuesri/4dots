import type { EventErrorsType } from '@4dots/shared';
import { atom } from 'jotai';

export const ModalTypeAtom = atom<EventErrorsType | null>(null);
