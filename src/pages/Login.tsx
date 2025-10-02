import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as any;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login(username, password);
    nav(loc.state?.from?.pathname || "/");
  }

  return (
    <div className="flex items-center justify-center py-20">
      <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-xl p-8 w-full max-w-md shadow-sm">
        <h1 className="text-2xl font-semibold mb-6">Sign in to Altair</h1>
        <div className="space-y-4">
          <input className="w-full border rounded-md p-2" placeholder="Username (e.g. teacher or student)" value={username} onChange={e=>setUsername(e.target.value)} />
          <input className="w-full border rounded-md p-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="w-full bg-slate-900 text-white rounded-md py-2">Sign in</button>
        </div>
        <p className="text-xs text-slate-500 mt-4">Ephemeral, secure labs. No setup required.</p>
      </form>
    </div>
  );
}
