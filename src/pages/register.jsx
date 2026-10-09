import { useState } from "react";
import AuthCard from "../components/auth/AuthCard";
import RegisterForm from "../components/auth/RegisterForm";

export default function Register() {
  const [status, setStatus] = useState(null);
  return <AuthCard mode="register" status={status}><RegisterForm setStatus={setStatus}/></AuthCard>;
}
