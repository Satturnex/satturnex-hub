import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
// Supabase supports both current publishable keys and legacy anon JWT keys.
// Prefer the current name, retaining the legacy variable for older deployments.
const publicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabaseConfigured = Boolean(url?.trim() && publicKey?.trim());
const supabase = supabaseConfigured ? createClient(url.trim(), publicKey.trim()) : null;

function requireClient() {
  if (!supabase) throw new Error("Autenticação indisponível. Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY (ou a variável legada VITE_SUPABASE_ANON_KEY).");
  return supabase;
}

function mapUser(user) {
  if (!user) return null;
  const metadata = user.user_metadata || {};
  return { id: user.id, name: metadata.full_name || metadata.name || user.email?.split("@")[0] || "Usuário", email: user.email || "", avatar: metadata.avatar_url || "", role: "Membro" };
}

function authError(error) {
  const message = error?.message || "Não foi possível concluir a operação. Tente novamente.";
  if (/invalid login credentials/i.test(message)) return new Error("E-mail ou senha incorretos. Confira seus dados e tente novamente.");
  if (/email not confirmed/i.test(message)) return new Error("Confirme seu e-mail pelo link enviado antes de entrar.");
  if (/user already registered/i.test(message)) return new Error("Não foi possível criar a conta com esses dados. Se já possui uma conta, tente entrar.");
  return new Error(message);
}

export const authService = {
  async getSession() { const { data, error } = await requireClient().auth.getSession(); if (error) throw authError(error); return mapUser(data.session?.user); },
  async getRole(userId) {
    if (!userId) throw new Error("Sessão inválida.");
    const { data, error } = await requireClient().from("profiles").select("role").eq("id", userId).single();
    if (error) throw authError(error);
    if (!["OWNER", "ADMIN", "USER"].includes(data?.role)) throw new Error("Não foi possível validar suas permissões.");
    return data.role;
  },
  onAuthStateChange(callback) {
    if (!supabase) return () => {};
    const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(mapUser(session?.user)));
    return () => data.subscription.unsubscribe();
  },
  async register({ name, email, password }) {
    const client = requireClient();
    const { data, error } = await client.auth.signUp({ email: email.trim().toLowerCase(), password, options: { data: { full_name: name.trim() }, emailRedirectTo: `${window.location.origin}/login` } });
    if (error) throw authError(error);
    return { user: mapUser(data.user), session: Boolean(data.session) };
  },
  async login({ email, password }) {
    const { data, error } = await requireClient().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) throw authError(error);
    return mapUser(data.user);
  },
  async updateUser({ name, avatar, email }) {
    const attributes = { data: { full_name: name.trim(), avatar_url: avatar || "" } };
    if (email?.trim()) attributes.email = email.trim().toLowerCase();
    const { data, error } = await requireClient().auth.updateUser(attributes);
    if (error) throw authError(error);
    const user = mapUser(data.user);
    return { ...user, emailChangePending: Boolean(email && user.email !== email.trim().toLowerCase()) };
  },
  async resetPassword(email) {
    const { error } = await requireClient().auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${window.location.origin}/reset-password` });
    if (error) throw authError(error);
  },
  async setPassword(password) { const { data, error } = await requireClient().auth.updateUser({ password }); if (error) throw authError(error); return mapUser(data.user); },
  async logout() { const { error } = await requireClient().auth.signOut(); if (error) throw authError(error); },
};
