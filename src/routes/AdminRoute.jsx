import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function AdminRoute({ ownerOnly = false }) {
  const { role, roleLoading, roleError, initialized, refreshRole } = useAuth();
  const location = useLocation();
  useEffect(() => {
    void refreshRole();
    const handleFocus = () => { void refreshRole(); };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [location.pathname, refreshRole]);
  if (!initialized || roleLoading) return <div className="route-loading" role="status">Verificando suas permissões...</div>;
  if (roleError || !role) return <Navigate to="/acesso-negado" replace state={{ from: location }}/ >;
  const allowed = ownerOnly ? role === "OWNER" : role === "OWNER" || role === "ADMIN";
  return allowed ? <Outlet/> : <Navigate to="/acesso-negado" replace state={{ from: location }}/>;
}
