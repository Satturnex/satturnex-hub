/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState(false);
  const roleRequestRef = useRef(0);
  const [initialized, setInitialized] = useState(false);
  const [registrationPending, setRegistrationPending] = useState(false);
  useEffect(() => {
    let active = true;
    const resolveUser = async nextUser => {
      const currentGeneration = ++roleRequestRef.current;
      if (!active) return;
      setUser(nextUser); setRole(null); setRoleError(false); setInitialized(true);
      if (!nextUser) { setRoleLoading(false); return; }
      setRoleLoading(true);
      try {
        const nextRole = await authService.getRole(nextUser.id);
        if (active && currentGeneration === roleRequestRef.current) setRole(nextRole);
      } catch {
        if (active && currentGeneration === roleRequestRef.current) setRoleError(true);
      } finally {
        if (active && currentGeneration === roleRequestRef.current) setRoleLoading(false);
      }
    };
    const unsubscribe = authService.onAuthStateChange(nextUser => { void resolveUser(nextUser); });
    authService.getSession().then(nextUser => { if (active && !roleRequestRef.current) void resolveUser(nextUser); }).catch(() => { if (active) { setInitialized(true); setRoleError(true); } });
    return () => { active = false; unsubscribe(); };
  }, []);
  const login = async credentials => { const nextUser = await authService.login(credentials); setUser(nextUser); setRegistrationPending(false); return nextUser; };
  const register = async details => { const result = await authService.register(details); setUser(result.session ? result.user : null); setRegistrationPending(!result.session); return result; };
  const completeRegistration = () => setRegistrationPending(false);
  const updateUser = async changes => { const nextUser = await authService.updateUser(changes); setUser(nextUser); return nextUser; };
  const refreshRole = useCallback(async () => {
    const requestId = ++roleRequestRef.current;
    if (!user?.id) { setRole(null); setRoleError(false); setRoleLoading(false); return null; }
    setRoleLoading(true); setRoleError(false);
    try { const nextRole = await authService.getRole(user.id); if (requestId === roleRequestRef.current) setRole(nextRole); return nextRole; }
    catch { if (requestId === roleRequestRef.current) { setRole(null); setRoleError(true); } return null; }
    finally { if (requestId === roleRequestRef.current) setRoleLoading(false); }
  }, [user]);
  const logout = async () => { ++roleRequestRef.current; await authService.logout(); setUser(null); setRole(null); setRoleError(false); setRoleLoading(false); setRegistrationPending(false); };
  const value = useMemo(() => ({ user, role, roleLoading, roleError, refreshRole, initialized, login, register, completeRegistration, registrationPending, updateUser, logout, resetPassword: authService.resetPassword, setPassword: authService.setPassword, isAuthenticated: Boolean(user) }), [user, role, roleLoading, roleError, refreshRole, initialized, registrationPending]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa ser usado dentro de AuthProvider");
  return context;
}
