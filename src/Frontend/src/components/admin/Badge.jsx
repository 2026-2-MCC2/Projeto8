export default function Badge({ children, tone = "blue" }) {
  return <span className={`adm-badge adm-badge-${tone}`}>{children}</span>;
}