/**
 * Photos that take turns in the hero circle, in the original site's order.
 * Each wipes in over the last (WIPE seconds) and stays for HOLD seconds.
 */
export const HERO_PHOTOS = [
  { src: '/assets/baker.jpg', alt: 'Baker frosting a custom cake' },
  { src: '/assets/freelance.jpg', alt: 'Woman working on her laptop' },
  { src: '/assets/party.jpg', alt: 'Friends chatting at a get-together' },
];
export const PHOTO_WIPE = 1.6;
export const PHOTO_HOLD = 3.5;

/** Unicorn Studio "Ai Voice" scene behind the prompt bar, and its variable ranges. */
export const VOICE_PROJECT = 'WYXYVuz9Jgh7PEFpgtGG';
export const VOICE_IDLE = { Scale: 0.2, Amplitude: 0.12, Brightness: 0.35 };
export const VOICE_BASE = { Scale: 0.4, Amplitude: 0.29, Brightness: 1 };

export const VOICE_LABELS = {
  idle: 'Try it with your voice',
  requesting: 'Allow microphone…',
  listening: 'Listening · tap to stop',
  blocked: 'Mic blocked · try again',
  unavailable: 'Voice not supported',
};
