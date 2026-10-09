export default function EmptyState({ icon: Icon, title, description, action }) {
  return <div className="empty-state"><span className="empty-state-icon">{Icon && <Icon size={22}/>}</span><h2>{title}</h2><p>{description}</p>{action}</div>;
}
