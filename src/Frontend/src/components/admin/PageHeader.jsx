export default function PageHeader({
  eyebrow = "WORKSPACE",
  title,
  description,
  action,
}) {
  return (
    <div className="adm-page-header">
      <div>
        <span className="adm-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>

      {action}
    </div>
  );
}