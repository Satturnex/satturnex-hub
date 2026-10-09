import Card from "./Card";

export default function StatCard({ label, value, note, icon: Icon, tone = "purple" }) {
  return <Card className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon tone-${tone}`}><Icon size={19} /></span></div><strong>{value}</strong><small>{note}</small></Card>;
}
