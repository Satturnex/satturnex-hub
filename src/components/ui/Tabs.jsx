export default function Tabs({ items, value, onChange, label = "Abas" }) {
  return <div className="tabs" role="tablist" aria-label={label}>{items.map(item => <button role="tab" aria-selected={value === item.id} className={value === item.id ? "active" : ""} key={item.id} onClick={() => onChange(item.id)}>{item.label}</button>)}</div>;
}
