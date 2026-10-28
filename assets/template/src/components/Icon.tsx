import React from "react";

// Simple line icons drawn on a 24 x 24 grid.
const PATHS: Record<string, React.ReactNode> = {
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5 12 13l8.5-6.5" />
    </>
  ),
  check: <path d="M5 12.5 10 17.5 19 7.5" />,
  play: <path d="M8 5.5v13l10.5-6.5z" />,
  doc: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4M9 12h6M9 15.5h6M9 9h3" />
    </>
  ),
  folder: <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3 19.5c.6-3.3 3-5 6-5s5.4 1.7 6 5" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M16 14.3c2.6.2 4.4 1.8 5 4.7" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M5 20c.8-3.8 3.5-5.8 7-5.8s6.2 2 7 5.8" />
    </>
  ),
  warning: (
    <>
      <path d="M12 3.5 21.5 20h-19z" />
      <path d="M12 10v4.5M12 17.2v.3" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="6" rx="7.5" ry="2.8" />
      <path d="M4.5 6v12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V6M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15 15 5.5 5.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  chart: <path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6" />,
  gantt: <path d="M4 5h9M7 10h10M10 15h9M4 20h16" />,
  ship: (
    <>
      <path d="M3 16h18l-2.5 4h-13z" />
      <path d="M6 16V11h12v5M9 11V7h4v4M15 11l3-6" />
    </>
  ),
  spark: <path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3" />,
  bolt: <path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" />,
  history: (
    <>
      <path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5" />
      <path d="M4 4v4.5h4.5M12 8v4.5l3 2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 19.5 6v5.5c0 4.6-3.2 8-7.5 9.5-4.3-1.5-7.5-4.9-7.5-9.5V6z" />
      <path d="m8.8 12 2.3 2.3 4.2-4.6" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V5.5L13 3v18M13 9h7v12M2.5 21h19" />
      <path d="M7.5 8h2M7.5 12h2M7.5 16h2M16 13h1.5M16 17h1.5" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M5.5 18.5l2.1-2.1M16.4 7.6l2.1-2.1" />
    </>
  ),
  phone: <path d="M6.5 3.5h3l1.5 4.5-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4.5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2z" />,
  grid: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" />
      <path d="M3.5 9.2h17M3.5 14.8h17M9.2 3.5v17M14.8 3.5v17" />
    </>
  ),
  chat: <path d="M4 5.5h16v10H10l-4.5 4v-4H4z" />,
  scale: (
    <>
      <path d="M12 4v16M7 20h10M5 7h14" />
      <path d="M5 7 2.5 13h5zM19 7l-2.5 6h5z" />
    </>
  ),
  euro: (
    <>
      <path d="M17.5 6.5A6.5 6.5 0 1 0 17.5 17.5" />
      <path d="M4.5 10.5h9M4.5 13.5h9" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 4.5-9 4.5-9-4.5z" />
      <path d="m3 12 9 4.5 9-4.5M3 16.5 12 21l9-4.5" />
    </>
  ),
  send: <path d="M3.5 11.5 20.5 4l-4 16.5-5-6.5zM11.5 14 20.5 4" />,
  wave: <path d="M2.5 9c2.5-2.5 4.5-2.5 7 0s4.5 2.5 7 0 3.5-2 5 0M2.5 15c2.5-2.5 4.5-2.5 7 0s4.5 2.5 7 0 3.5-2 5 0" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.2l3.4 2" />
    </>
  ),
  attach: <path d="M19 11.5 11.8 18.7a4.5 4.5 0 0 1-6.4-6.4l7.6-7.6a3 3 0 0 1 4.2 4.2L9.9 16.2a1.5 1.5 0 0 1-2.1-2.1l6.7-6.7" />,
  arrowRight: <path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" />,
  // Added for film 2
  mobile: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path d="M11 18.5h2" />
    </>
  ),
  cloud: <path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.6 9.2 4.7 4.7 0 0 0 7 18.5z" />,
  satellite: (
    <>
      <path d="M12 8.5 15.5 12 12 15.5 8.5 12z" />
      <path d="M3 7.5 7.5 3l3 3L6 10.5zM13.5 18 18 13.5l3 3-4.5 4.5z" />
    </>
  ),
  pause: <path d="M9 5v14M15 5v14" />,
  refresh: (
    <>
      <path d="M19.5 8.5A8 8 0 0 0 5 9M4.5 15.5A8 8 0 0 0 19 15" />
      <path d="M19.5 4v4.5H15M4.5 20v-4.5H9" />
    </>
  ),
  wifiOff: <path d="M3 8.5a14 14 0 0 1 18 0M6 12a9.5 9.5 0 0 1 12 0M9 15.5a5 5 0 0 1 6 0M12 19h.01M4 4l16 16" />,
  key: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 8.5-8.5M16 7l2.5 2.5M14 9l2 2" />
    </>
  ),
  cube: (
    <>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </>
  ),
  flag: <path d="M5 21V4M5 4.5h12l-2.5 4 2.5 4H5" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.8" />
    </>
  ),
  hub: (
    <>
      <circle cx="12" cy="12" r="3" />
      <circle cx="4.5" cy="5" r="1.8" />
      <circle cx="19.5" cy="5" r="1.8" />
      <circle cx="4.5" cy="19" r="1.8" />
      <circle cx="19.5" cy="19" r="1.8" />
      <path d="m6 6.4 3.8 3.5M18 6.4l-3.8 3.5M6 17.6l3.8-3.5M18 17.6l-3.8-3.5" />
    </>
  ),
  server: (
    <>
      <rect x="4" y="3.5" width="16" height="7" rx="1.5" />
      <rect x="4" y="13.5" width="16" height="7" rx="1.5" />
      <path d="M7.5 7h.01M7.5 17h.01M11 7h5M11 17h5" />
    </>
  ),
  link: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
  cross: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  question: (
    <>
      <path d="M9 9a3 3 0 1 1 4 2.8c-.7.3-1 .9-1 1.7v.5" />
      <path d="M12 17.5v.3" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  compass: (
    <>
      <path d="M12 3v3M8 21l4-15 4 15" />
      <path d="M6.5 15h11" />
      <circle cx="12" cy="4.5" r="1.5" />
    </>
  ),
};

export type IconName = keyof typeof PATHS;

export const Icon: React.FC<{
  name: IconName;
  size?: number;
  colour?: string;
  stroke?: number;
  style?: React.CSSProperties;
}> = ({ name, size = 24, colour = "currentColor", stroke = 1.8, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={colour}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0, ...style }}
  >
    {PATHS[name]}
  </svg>
);
