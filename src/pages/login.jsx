import { useState } from "react";
import AuthCard from "../components/auth/AuthCard";
import LoginForm from "../components/auth/LoginForm";

export default function Login() {
  const [status, setStatus] = useState(null);
  return <AuthCard mode="login" status={status}><LoginForm setStatus={setStatus}/></AuthCard>;
}
