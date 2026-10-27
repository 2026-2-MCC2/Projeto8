// Ícones da Home (traço de 1,8px, mesmo estilo do Icon do organizador).
const ICONES = {
  utensils: (<><path d="M5 3v8a2 2 0 0 0 2 2v8" /><path d="M9 3v8" /><path d="M5 7h4" /><path d="M17 3c-2 2-3 4.5-3 7s1 3 3 3v8" /></>),
  palette: (<><path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1.3-1-1.6-1-2.8 0-.9.7-1.5 1.7-1.5H17a4 4 0 0 0 4-4C21 6.7 17 3 12 3Z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="15" cy="7.5" r="1" /></>),
  shield: (<><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.500 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>),
  sparkles: (<><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="m6 6 2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" /></>),
  cube: (<><path d="M12 3 4 7.500v9L12 21l8-4.500v-9L12 3Z" /><path d="M4 7.500 12 12l8-4.500M12 12v9" /></>),
  camera: (<><path d="M4 8h3l2-3h6l2 3h3v11H4V8Z" /><circle cx="12" cy="13" r="3.500" /></>),
  target: (<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>),
  search: (<><circle cx="10.500" cy="10.500" r="6.500" /><path d="m16 16 5 5" /></>),
  ticket: (<><path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4V7Z" /><path d="M12 8.500v7" /></>),
  arrow: (<><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>),
  menu: (<><path d="M4 7h16M4 12h16M4 17h16" /></>),
  close: (<><path d="m6 6 12 12M18 6 6 18" /></>),
  sheet: (<><path d="M7 3h7l4 4v14H7V3Z" /><path d="M14 3v4h4M10 12h5M10 16h5" /></>),
  message: (<><path d="M4 5h16v11H9l-5 4V5Z" /></>),
  calc: (<><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" /></>),
  bulb: (<><path d="M9 18h6M10 21h4" /><path d="M8.500 14.500A6 6 0 1 1 15.500 14c-.8.700-1.500 1.500-1.500 2.500h-4c0-1-.7-1.800-1.500-2Z" /></>),
};

export default function Icone({ nome, tamanho = 18, className = "" }) {
  const conteudo = ICONES[nome];

  if (!conteudo) return null;

  return (
    <svg
      className={className}
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {conteudo}
    </svg>
  );
}
