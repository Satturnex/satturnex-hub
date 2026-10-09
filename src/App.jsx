import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import GuestRoute from "./routes/GuestRoute";
import AdminRoute from "./routes/AdminRoute";
import AppLayout from "./components/layout/AppLayout";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import EmptyState from "./components/ui/EmptyState";
import { CircleHelp } from "lucide-react";
import { RecoverPassword, ResetPassword } from "./pages/PasswordRecovery";

const Dashboard = lazy(() => import("./pages/dashboard"));
const Applications = lazy(() => import("./pages/Applications"));
const ApplicationDetails = lazy(() => import("./pages/ApplicationDetails"));
const Activities = lazy(() => import("./pages/Activities"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminCenter = lazy(() => import("./pages/AdminCenter"));

function LoadingPage() { return <div className="route-loading" role="status">Carregando seu espaço de trabalho...</div>; }
function NotFound() { return <div className="not-found-page"><EmptyState icon={CircleHelp} title="Página não encontrada" description="Este endereço não faz parte do portal." action={<a className="button button-primary" href="/">Voltar ao início</a>}/></div>; }
function AccessDenied() { return <div className="not-found-page"><EmptyState icon={CircleHelp} title="Acesso não autorizado" description="Sua conta não possui permissão para acessar este recurso." action={<a className="button button-primary" href="/dashboard">Voltar ao dashboard</a>}/></div>; }

export default function App() {
  return <ThemeProvider><AuthProvider><BrowserRouter><Suspense fallback={<LoadingPage/>}><Routes><Route path="/" element={<Home/>}/><Route path="/recover-password" element={<RecoverPassword/>}/><Route path="/reset-password" element={<ResetPassword/>}/><Route path="/acesso-negado" element={<AccessDenied/>}/><Route element={<GuestRoute/>}><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/></Route><Route element={<ProtectedRoute/>}><Route element={<AppLayout/>}><Route path="/dashboard" element={<Dashboard/>}/><Route path="/applications" element={<Applications/>}/><Route path="/applications/:id" element={<ApplicationDetails/>}/><Route path="/activities" element={<Activities/>}/><Route path="/favorites" element={<Favorites/>}/><Route path="/notifications" element={<Notifications/>}/><Route path="/settings" element={<Settings/>}/></Route><Route element={<AdminRoute/>}><Route path="/admin/:section" element={<AdminCenter/>}/></Route><Route element={<AdminRoute ownerOnly/>}><Route path="/admin/permissions" element={<AdminCenter/>}/></Route></Route><Route path="*" element={<NotFound/>}/></Routes></Suspense></BrowserRouter></AuthProvider></ThemeProvider>;
}
