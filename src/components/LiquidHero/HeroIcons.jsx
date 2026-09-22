/*
 * Line icons for the liquid hero. All stroke with `currentColor`, so the
 * stylesheet colours them through `color`.
 */

const line = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function Icon({ children, size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...line} {...props}>
      {children}
    </svg>
  );
}

export const SparkleIcon = (props) => (
  <Icon {...props}>
    <path d="M10 3.5 11.6 8.4 16.5 10 11.6 11.6 10 16.5 8.4 11.6 3.5 10 8.4 8.4Z" />
    <path d="M18 14.5 18.8 16.7 21 17.5 18.8 18.3 18 20.5 17.2 18.3 15 17.5 17.2 16.7Z" />
  </Icon>
);

export const ArrowUpRightIcon = (props) => (
  <Icon {...props}>
    <path d="M7 17 17 7M9 7h8v8" />
  </Icon>
);

export const PlayIcon = (props) => (
  <Icon {...props}>
    <path d="M8 5.5v13l10.5-6.5Z" fill="currentColor" stroke="none" />
  </Icon>
);

export const PauseIcon = (props) => (
  <Icon {...props}>
    <path d="M8 5.5v13M16 5.5v13" strokeWidth="3" />
  </Icon>
);

export const CheckIcon = (props) => (
  <Icon {...props}>
    <path d="m5 12.5 4.5 4.5L19 7.5" strokeWidth="2" />
  </Icon>
);

export const WaveIcon = (props) => (
  <Icon {...props}>
    <path d="M3 10v4M6 7v10M9 9v6M12 4v16M15 8v8M18 6v12M21 10v4" />
  </Icon>
);

export const VoiceModeIcon = (props) => (
  <Icon {...props}>
    <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
    <path d="M9 10v4M12 8v8M15 10v4" />
  </Icon>
);

export const TextModeIcon = (props) => (
  <Icon {...props}>
    <path d="M12 3.5c4.7 0 8.5 3.4 8.5 7.6s-3.8 7.6-8.5 7.6c-1 0-2-.1-2.9-.4L4.5 20l1.2-3.6c-1.4-1.4-2.2-3.2-2.2-5.3 0-4.2 3.8-7.6 8.5-7.6Z" />
    <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" strokeWidth="2.4" />
  </Icon>
);

export const TimerIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.5 2.5M10 2.5h4" />
  </Icon>
);

export const Clock24Icon = (props) => (
  <Icon {...props}>
    <path d="M20.5 12A8.5 8.5 0 1 1 12 3.5c2.6 0 4.9 1.2 6.5 3" />
    <path d="M18.5 3v3.5H15M12 7.5V12l3 2" />
  </Icon>
);

export const ChevronLeftIcon = (props) => (
  <Icon {...props}>
    <path d="M15 5 8 12l7 7" />
  </Icon>
);

export const STAT_ICONS = {
  timer: TimerIcon,
  clock24: Clock24Icon,
  voice: WaveIcon,
};
