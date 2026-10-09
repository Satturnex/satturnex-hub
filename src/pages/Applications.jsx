import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import ApplicationCard from "../components/applications/ApplicationCard";
import PageHeader from "../components/ui/PageHeader";
import { applicationsService } from "../services/applicationsService";

const FAVORITES_KEY = "satturnex-favorites";
const readFavorites = () => {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []; }
  catch { return []; }
};

export default function Applications() {
  const [params, setParams] = useSearchParams();
  const query = params.get("search") || "";
  const category = params.get("category") || "Todas";
  const [applications, setApplications] = useState([]);
  const [sort, setSort] = useState("name");
  const [favorites, setFavorites] = useState(readFavorites);

  useEffect(() => { applicationsService.list().then(setApplications); }, []);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  const categories = ["Todas", ...new Set(applications.map(application => application.category))];
  const visibleApplications = useMemo(() => applications
    .filter(application => (category === "Todas" || application.category === category)
      && `${application.name} ${application.description} ${application.category}`.toLowerCase().includes(query.toLowerCase()))
    .sort((left, right) => sort === "status"
      ? left.status.localeCompare(right.status)
      : left.name.localeCompare(right.name)), [applications, category, query, sort]);

  const updateFavorite = (id, enabled) => {
    const next = enabled ? [...new Set([...favorites, id])] : favorites.filter(item => item !== id);
    setFavorites(next);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  };

  return <>
    <PageHeader eyebrow="PORTAL SATTURNEX" title="Aplicações" description="Acesse e descubra as ferramentas disponíveis no seu ecossistema."/>
    <div className="applications-toolbar">
      <label className="filter-search"><Search size={16}/><input value={query} onChange={event => setFilter("search", event.target.value)} placeholder="Buscar aplicações..." aria-label="Buscar aplicações"/></label>
      <label className="filter-select"><SlidersHorizontal size={15}/><select aria-label="Filtrar por categoria" value={category} onChange={event => setFilter("category", event.target.value === "Todas" ? "" : event.target.value)}>{categories.map(item => <option key={item}>{item}</option>)}</select></label>
      <label className="filter-select"><select aria-label="Ordenar aplicações" value={sort} onChange={event => setSort(event.target.value)}><option value="name">Nome A–Z</option><option value="status">Status</option></select></label>
    </div>
    {visibleApplications.length ? <div className="applications-grid">{visibleApplications.map(application => <ApplicationCard key={application.id} application={application} favorite={favorites.includes(application.id)} onFavorite={updateFavorite}/>)}</div> : <div className="inline-empty">Nenhuma aplicação corresponde à busca.</div>}
  </>;
}
