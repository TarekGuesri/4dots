import { useAtomValue } from 'jotai';
import type { Sound } from '@app-types';
import { SoundAtom } from '@state/ui';

export function usePlaySound() {
	const soundEnabled = useAtomValue(SoundAtom);

	const playSound = (sound: Sound) => {
		if (!soundEnabled) return;

		const audio = new Audio(`/sounds/${sound}.mp3`);
		audio.play();
	};

	return { playSound };
}
