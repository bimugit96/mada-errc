/**
 * Set ikon SVG yang dikongsi oleh semua komponen dashboard.
 * Penggunaan: <Icon name="users" /> — saiz & warna mengikut CSS.
 */
const PATHS = {
  home: (
    <>
      <path d="m3 9.5 9-7 9 7V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V13h6v9" />
    </>
  ),
  check: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
      <path d="m8.2 12.2 2.8 2.8 5-5.6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="7" r="3.6" fill="currentColor" stroke="none" />
      <path
        d="M2.5 19.5c0-3.1 2.9-5.5 6.5-5.5s6.5 2.4 6.5 5.5v1h-13v-1z"
        fill="currentColor"
        stroke="none"
      />
      <circle cx="17" cy="8" r="2.8" fill="currentColor" opacity="0.82" stroke="none" />
      <path
        d="M15.8 14.3c3 .3 5.2 2.2 5.2 4.8v1.4h-4.2v-1c0-2-.6-3.7-1.8-5.2z"
        fill="currentColor"
        opacity="0.82"
        stroke="none"
      />
    </>
  ),
  usersOutline: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  usersGroup: (
    <>
      <circle cx="12" cy="7" r="3.2" fill="currentColor" stroke="none" />
      <circle cx="5.8" cy="9.2" r="2.5" fill="currentColor" opacity="0.78" stroke="none" />
      <circle cx="18.2" cy="9.2" r="2.5" fill="currentColor" opacity="0.78" stroke="none" />
      <path
        d="M6.5 19.5c0-2.8 2.5-5 5.5-5s5.5 2.2 5.5 5v1h-11v-1z"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M1.8 19.5c0-2.1 1.6-3.8 3.9-4.1-.6 1.1-.9 2.5-.9 4.1v1H1.8v-1zM22.2 19.5c0-2.1-1.6-3.8-3.9-4.1.6 1.1.9 2.5.9 4.1v1h3v-1z"
        fill="currentColor"
        opacity="0.78"
        stroke="none"
      />
    </>
  ),
  userPlus: (
    <>
      <circle cx="9" cy="7.2" r="3.8" fill="currentColor" stroke="none" />
      <path
        d="M2.5 19.5c0-3.2 2.9-5.6 6.5-5.6s6.5 2.4 6.5 5.6v1h-13v-1z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M19 8v6M22 11h-6" strokeWidth="2.5" />
    </>
  ),
  doc: (
    <>
      <path
        d="M6 2.5h8.2L19.5 7.8V20a1.8 1.8 0 0 1-1.8 1.8H6A1.8 1.8 0 0 1 4.2 20V4.3A1.8 1.8 0 0 1 6 2.5z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M14 2.5V8h5.5" stroke="#fff" strokeWidth="1.6" fill="none" />
      <path d="M8 12.2h8M8 15.5h8M8 8.9h4" stroke="#fff" strokeWidth="1.8" />
    </>
  ),
  docOutline: (
    <>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </>
  ),
  swap: (
    <>
      <path d="m15 4 4 4-4 4" strokeWidth="2.3" />
      <path d="M5 8h14" strokeWidth="2.3" />
      <path d="m9 12-4 4 4 4" strokeWidth="2.3" />
      <path d="M19 16H5" strokeWidth="2.3" />
    </>
  ),
  bars: (
    <>
      <path d="M4 20v-6" />
      <path d="M10 20V9" />
      <path d="M16 20v-9" />
      <path d="M21 20V5" />
      <path d="M3 20.5h19" />
    </>
  ),
  barsTrend: (
    <>
      <rect x="4" y="14" width="3.2" height="6.5" rx="0.8" fill="currentColor" stroke="none" />
      <rect x="9.5" y="10.8" width="3.2" height="9.7" rx="0.8" fill="currentColor" stroke="none" />
      <rect x="15" y="7.2" width="3.2" height="13.3" rx="0.8" fill="currentColor" stroke="none" />
      <path d="M4 11.2 10.5 6.8 18.5 3.5" strokeWidth="2.1" />
      <path d="M14.8 3.2h4v4" strokeWidth="2.1" />
    </>
  ),
  gauge: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2.5" />
      <path d="M9 4V3h6v1" />
      <circle cx="12" cy="11" r="2" />
      <path d="M8.5 17c.4-1.8 1.6-2.8 3.5-2.8s3.1 1 3.5 2.8" />
    </>
  ),
  trendUp: (
    <>
      <path d="m22 7-8.5 8.5-5-5L2 17" />
      <path d="M16 7h6v6" />
    </>
  ),
  target: (
    <>
      <circle cx="11.5" cy="12.5" r="8.5" strokeWidth="2" />
      <circle cx="11.5" cy="12.5" r="4.8" strokeWidth="2" />
      <circle cx="11.5" cy="12.5" r="1.8" fill="currentColor" stroke="none" />
      <path d="m16 8 5-5M17.5 3H21v3.5" strokeWidth="2" />
    </>
  ),
  upload: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m17 8-5-5-5 5M12 3v12" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2.5" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </>
  ),
  leaf: (
    <>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </>
  ),
  fish: (
    <>
      <path
        d="M2.5 12c3.2-5.4 10-6.4 14-3l4-3.2v12.4l-4-3.2c-4 3.4-10.8 2.4-14-3Z"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <circle cx="7.5" cy="11" r=".9" fill="currentColor" />
    </>
  ),
  store: (
    <>
      <path d="m3 9 1.6-5h14.8L21 9" />
      <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
      <path d="M5 12.5V21h14v-8.5" />
      <path d="M10 21v-5h4v5" />
    </>
  ),
  coins: (
    <>
      <ellipse cx="9" cy="7" rx="5.5" ry="2.5" />
      <path d="M3.5 7v4c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5V7" />
      <path d="M3.5 11v4c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-4" />
      <ellipse cx="16.5" cy="11.5" rx="4.5" ry="2" />
      <path d="M12 11.5v4c0 1.1 2 2 4.5 2s4.5-.9 4.5-2v-4" />
      <path d="M12 15.5v3c0 1.1 2 2 4.5 2s4.5-.9 4.5-2v-3" />
    </>
  ),
  sprout: (
    <>
      <circle cx="12" cy="8.5" r="3" />
      <path d="M6.5 19c.6-2.9 2.7-4.6 5.5-4.6s4.9 1.7 5.5 4.6" />
    </>
  ),
  trophy: (
    <>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </>
  ),
  map: (
    <>
      <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" />
      <path d="M9 3v15M15 6v15" />
    </>
  ),
  pin: (
    <>
      <circle cx="12" cy="8.5" r="3.2" />
      <path d="M6.2 19.2c.7-3 2.9-4.7 5.8-4.7s5.1 1.7 5.8 4.7" />
    </>
  ),
  box: (
    <>
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
    </>
  ),
  wallet: (
    <>
      <path d="M4.5 7.5A2.5 2.5 0 0 1 7 5h10a2.5 2.5 0 0 1 2.5 2.5v9A2.5 2.5 0 0 1 17 19H7a2.5 2.5 0 0 1-2.5-2.5z" />
      <path d="M14 12.3h5.5v4.4H14a2.2 2.2 0 0 1 0-4.4z" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
  arrowUp: <path d="M12 19V5m-6 6 6-6 6 6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  filter: <path d="M22 3H2l8 9.46V19l4 2v-8.54z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="m7 15 4-4 3 3 5-6" />
    </>
  ),
};

export default function Icon({ name, className = '', strokeWidth = 1.8 }) {
  return (
    <svg
      className={`icon ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name] || null}
    </svg>
  );
}
