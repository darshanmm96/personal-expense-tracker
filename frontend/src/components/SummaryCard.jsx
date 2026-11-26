const SummaryCard = ({ title, value, icon: Icon, tone = 'primary', subtitle, trend }) => (
  <article className={`summary-card summary-${tone}`}>
    <div className="summary-card-top">
      <div className="summary-icon">
        <Icon size={22} strokeWidth={2} />
      </div>
      {trend !== undefined && trend !== null && (
        <span className={`summary-trend${trend < 0 ? ' negative' : ''}`}>
          {trend > 0 ? '+' : ''}{Number(trend).toFixed(1)}%
        </span>
      )}
    </div>
    <p className="summary-title">{title}</p>
    <h2 className="summary-value">{value}</h2>
    {subtitle && <p className="summary-subtitle">{subtitle}</p>}
  </article>
);

export default SummaryCard;
