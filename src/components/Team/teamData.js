/** Section header above the team card. */
export const TEAM_TITLE = {
  subtitle: 'The humans behind the AI.',
  heading: 'Meet the Team Behind Better Pitch',
  description: 'The people building voice agents that sound human and close like your best rep.',
};

/**
 * One entry per person, shown one at a time. Photos go in public/assets/team/;
 * until a file is there the portrait falls back to the person's initials.
 */
export const TEAM = [
  {
    name: 'Kunal Jaggi',
    role: 'Founder & CEO',
    badge: 'CEO',
    photo: '/assets/team/kunal-jaggi.jpg',
    bio: 'The visionary architect scaling AI to the edges of telecommunications. He builds the bridge between legacy systems and the autonomous future.',
    linkedin: '#',
  },
  {
    name: 'Pritesh Jaiswal',
    role: 'CTO',
    badge: 'CTO',
    photo: '/assets/team/pritesh-jaiswal.jpg',
    bio: 'The technical mastermind behind the magic. He dreams in neural networks and engineers voice agents that don’t just speak — they understand.',
    linkedin: '#',
  },
  {
    name: 'Srishti Khatri',
    role: 'Head of Sales',
    badge: 'Sales',
    photo: '/assets/team/srishti-khatri.jpg',
    bio: 'A strategic sales leader driving revenue growth through high-impact partnerships and data-driven client acquisition. She excels at turning market opportunities into long-term commercial success.',
    linkedin: '#',
  },
];

/** Seconds each person stays on screen before the next one wipes in. */
export const TEAM_HOLD = 2.5;
export const TEAM_WIPE = 1.4;
