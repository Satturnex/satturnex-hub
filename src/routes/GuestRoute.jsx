import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function GuestRoute() {
  const { isAuthenticated, initialized, registrationPending } = useAuth();
  const location = useLocation();
  const showingRegistrationSuccess = registrationPending && location.pathname === "/register";
  if (!initialized) return <div className="route-loading" role="status">Verificando sua sessão...</div>;
  return isAuthenticated && !showingRegistrationSuccess ? <Navigate to="/dashboard" replace/> : <Outlet/>;
}
