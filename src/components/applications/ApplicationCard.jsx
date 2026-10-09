import { useState } from "react";
import { ArrowUpRight, ChartNoAxesCombined, Heart, Layers3, LifeBuoy, Orbit } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../ui/Badge";
import Card from "../ui/Card";

const applicationIcons = { orbit: Orbit, layers: Layers3, chart: ChartNoAxesCombined, "life-buoy": LifeBuoy };

export default function ApplicationCard({ application, favorite = false, onFavorite }) {
  const [saved, setSaved] = useState(favorite);
  const Icon = applicationIcons[application.icon] || Orbit;
  const toggleFavorite = () => {
    const next = !saved;
    setSaved(next);
    onFavorite?.(application.id, next);
  };
  const openInNewTab = application.href?.startsWith("http");

  return <Card className="application-card">
    <div className="app-card-top"><span className="application-icon"><Icon size={21}/></span><button className={`favorite-toggle ${saved ? "is-favorite" : ""}`} onClick={toggleFavorite} aria-label={saved ? "Remover dos favoritos" : "Adicionar aos favoritos"} aria-pressed={saved}><Heart size={17} fill={saved ? "currentColor" : "none"}/></button></div>
    <div className="app-card-name"><h2>{application.name}</h2><Badge tone={application.status === "Online" ? "green" : "muted"}>{application.status}</Badge></div>
    <p>{application.description}</p>
    <div className="app-card-meta"><span>{application.category}</span><span>Atualizado {application.updated}</span></div>
    <div className="app-card-actions"><Link className="button button-primary" to={`/applications/${application.id}`}>Detalhes <ArrowUpRight size={15}/></Link>{application.href ? <a className="app-open-link" href={application.href} target={openInNewTab ? "_blank" : undefined} rel={openInNewTab ? "noreferrer" : undefined}>Abrir</a> : <span className="app-open-link disabled">Em breve</span>}</div>
  </Card>;
}
