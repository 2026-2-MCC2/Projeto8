import Icon from "../organizador/Icon";

export default function StatCard({ label, value, change, icon, tone = "" }) {
  return (
    <div className="adm-stat-card">
      <div className={`adm-stat-icon ${tone}`}>
        <Icon name={icon} size={19} />
      </div>

      <div>
        <p className="adm-stat-label">{label}</p>
        <strong className="adm-stat-value">{value}</strong>

        {change && (
          <p className="adm-stat-change">
            <Icon name="trend" size={13} /> {change}
          </p>
        )}
      </div>
    </div>
  );
}