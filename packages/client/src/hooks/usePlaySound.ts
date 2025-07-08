import { useAtomValue } from 'jotai';
import { useRef } from 'react';

import { SoundAtom } from '@state/ui';

import type { Sound } from '@app-types';

export function usePlaySound() {
	const soundEnabled = useAtomValue(SoundAtom);
	const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

	const playSound = (sound: Sound) => {
		if (!soundEnabled) return;

		// Stop any existing sound of the same type first
		if (audioRefs.current[sound]) {
			audioRefs.current[sound].pause();
			audioRefs.current[sound].currentTime = 0;
		}

		const audio = new Audio(`/sounds/${sound}.mp3`);
		audioRefs.current[sound] = audio;
		audio.play();
	};

	const pauseSound = (sound: Sound) => {
		const audio = audioRefs.current[sound];
		if (audio) {
			audio.pause();
		}
	};

	const stopSound = (sound: Sound) => {
		const audio = audioRefs.current[sound];
		if (audio) {
			audio.pause();
			audio.currentTime = 0;
		}
	};

	const stopAllSounds = () => {
		Object.values(audioRefs.current).forEach((audio) => {
			if (audio) {
				audio.pause();
				audio.currentTime = 0;
			}
		});
	};

	return { playSound, pauseSound, stopSound, stopAllSounds };
}
