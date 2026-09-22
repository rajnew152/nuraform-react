export const LIQUID_HERO = {
  badge: 'The AI Voice Agent Built For Sales Teams',
  /* `accent` is set in the italic serif after the bold sans `lead`. */
  heading: {
    lead: 'Put your best rep on every call, qualify every lead,',
    accent: '& book meetings around the clock.',
  },
  copy: 'Better Pitch AI voice agents pick up in under a second, qualify every lead, book the meeting and update your CRM, 24/7, in a voice that sounds like your best rep.',
};

/** The two modes of the demo panel, switched by the toggle above it. */
export const DEMO_MODES = [
  { id: 'voice', label: 'Voice AI' },
  { id: 'text', label: 'Text AI' },
];

/** Voice mode: the voice-reactive orb, then recorded sample calls. */
export const VOICE_DEMO = {
  status: {
    idle: 'Tap the orb to talk',
    requesting: 'Allow microphone…',
    listening: 'Listening · tap to stop',
    blocked: 'Mic blocked · allow it and tap again',
    unavailable: 'Voice not supported in this browser',
  },
  /*
   * Drop the recordings into public/assets/samples/ under these names. Each
   * row reads its length from the file itself, so there is nothing to update.
   */
  samples: [
    { title: 'Sample 1: "Inbound lead qualification"', src: '/assets/samples/sample-1.mp3' },
    { title: 'Sample 2: "Booking a discovery call"', src: '/assets/samples/sample-2.mp3' },
  ],
};

/** Text mode: a phone showing a short text thread, then the selling points. */
export const TEXT_DEMO = {
  contact: 'Better Pitch',
  stamp: 'Today 9:22 AM',
  messages: [
    { from: 'lead', text: 'Hi, saw your ad. Do you do demos this week?' },
    { from: 'agent', text: 'Hey! Yes, happy to. What does your team sell, and roughly how many calls a day?' },
    { from: 'lead', text: 'B2B software, about 60 inbound calls a day' },
    { from: 'agent', text: 'Perfect fit. I have Thursday 11am or 3pm open. Which works?' },
  ],
  points: [
    'Replies in seconds, day or night',
    'Same voice and script as your calls',
    'Books the meeting right in the thread',
    'Hands off to your team at any time',
  ],
};

/** The two buttons under both modes. `talk` starts the voice orb. */
export const DEMO_ACTIONS = {
  talk: 'Talk to AI',
  human: { label: 'Talk to a Human', href: '/demo' },
};

/** White pills along the bottom of the hero. */
export const HERO_STATS = [
  { icon: 'timer', label: 'Response time: < 1 second' },
  { icon: 'clock24', label: 'Available: 24/7 - 365' },
  { icon: 'voice', label: 'Sounds like your best rep' },
];

/** Check pills under the stats. Swap in real social proof when you have it. */
export const HERO_PROOF = [
  'Qualifies every lead',
  'Books meetings for you',
  'Updates your CRM',
  'Live in days, not months',
];

/**
 * Liquid palette, as 0-1 RGB. Pastel yellow / pink / sky / mint for the
 * reference look, anchored by the brand orange and magenta.
 */
export const LIQUID_COLORS = {
  yellow: [1.0, 0.93, 0.55],
  pink: [1.0, 0.56, 0.7],
  coral: [1.0, 0.42, 0.33],
  orange: [1.0, 0.64, 0.33],
  sky: [0.64, 0.79, 0.91],
  mint: [0.76, 0.9, 0.72],
};
