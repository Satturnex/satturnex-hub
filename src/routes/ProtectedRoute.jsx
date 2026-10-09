import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, initialized } = useAuth(); const location = useLocation();
  if (!initialized) return <div className="route-loading" role="status">Verificando sua sessão...</div>;
  return isAuthenticated ? <Outlet/> : <Navigate to="/login" replace state={{ from: location }}/>;
}
