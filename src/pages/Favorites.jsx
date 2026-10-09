import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import ApplicationCard from "../components/applications/ApplicationCard";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import { applicationsService } from "../services/applicationsService";

const FAVORITES_KEY = "satturnex-favorites";
const readFavorites = () => {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []; }
  catch { return []; }
};

export default function Favorites() {
  const [ids, setIds] = useState(readFavorites);
  const [applications, setApplications] = useState([]);
  useEffect(() => { applicationsService.list().then(setApplications); }, []);
  const saved = applications.filter(application => ids.includes(application.id));
  const updateFavorite = (id, enabled) => {
    const next = enabled ? [...new Set([...ids, id])] : ids.filter(item => item !== id);
    setIds(next);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  };

  return <>
    <PageHeader eyebrow="ACESSO RÁPIDO" title="Favoritos" description="Suas aplicações favoritas, sempre à mão."/>
    {saved.length > 0
      ? <div className="applications-grid">{saved.map(application => <ApplicationCard key={application.id} application={application} favorite onFavorite={updateFavorite}/>)}</div>
      : <EmptyState icon={Heart} title="Você ainda não adicionou nenhum favorito." description="Explore as aplicações e marque com o coração aquelas que quer acessar rapidamente." action={<Link className="button button-primary" to="/applications">Explorar aplicações</Link>}/>}
  </>;
}
