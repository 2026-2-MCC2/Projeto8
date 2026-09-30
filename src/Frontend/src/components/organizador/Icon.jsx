const ICONS = {
  dashboard: (
    <>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10.5V20h13v-9.5" />
      <path d="M9 20v-5h6v5" />
    </>
  ),

  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4M17 3v4M3 10h18" />
    </>
  ),

  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),

  quote: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),

  chart: (
    <>
      <path d="M4 19V5M4 19h17" />
      <path d="m8 15 3-4 3 2 5-7" />
    </>
  ),

  ticket: (
    <>
      <path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4V7Z" />
      <path d="M12 8.5v7" />
    </>
  ),

  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 15.5a1.7 1.7 0 0 0 .4 1.8l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6.4v-2.6h.1A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.6v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 .3 1.9 1.7 1.7 0 0 0 1.5 1h.1V14h-.1A1.7 1.7 0 0 0 19 15.5Z" />
    </>
  ),

  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.8 9a2.3 2.3 0 1 1 3.8 1.7c-1 .8-1.6 1.2-1.6 2.6" />
      <path d="M12 16.7h.01" />
    </>
  ),

  bell: (
    <>
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),

  download: (
    <>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </>
  ),

  arrow: <path d="m9 18 6-6-6-6" />,

  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),

  menu: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),

  cube: (
    <>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4 7.5 8 4.5 8-4.5" />
      <path d="M12 12v9" />
    </>
  ),

  money: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v10" />
      <path d="M15 9.5c-.7-.6-1.7-.9-2.8-.9-1.6 0-2.7.8-2.7 2 0 1.1.9 1.7 2.7 2 1.8.3 2.7.9 2.7 2.1 0 1.2-1.1 2-2.8 2-1.2 0-2.3-.4-3-1" />
    </>
  ),

  wallet: (
    <>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 16.5v-9Z" />
      <path d="M4 8h15" />
      <path d="M15 13h5" />
      <circle cx="15" cy="13" r=".7" />
    </>
  ),

  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.5a3 3 0 0 1 0 5.8" />
      <path d="M16 14a5 5 0 0 1 4.5 5" />
    </>
  ),


  filter: (
    <>
      <path d="M4 5h16l-6.5 7.5V18l-5 2v-7.5L4 5Z" />
    </>
  ),

  chevron: <path d="m7 10 5 5 5-5" />,

  location: (
    <>
      <path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),

  lightbulb: (
    <>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M8.5 14.5A7 7 0 1 1 15.5 14c-.9.8-1.5 1.7-1.5 3h-4c0-1.3-.6-2.2-1.5-3Z" />
    </>
  ),
};

export default function Icon({ name, className = "", size }) {
  const icon = ICONS[name];

  if (!icon) {
    return null;
  }

  return (
    <svg
      className={`organizador-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icon}
    </svg>
  );
}
