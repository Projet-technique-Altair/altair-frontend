import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="mx-auto max-w-6xl p-4 flex items-center gap-4">
        <Link to="/" className="font-bold text-lg text-slate-900">Altair</Link>
        {user && (
          <>
            <Link to="/" className="text-slate-600 hover:text-slate-900">Catalog</Link>
            <Link to="/dashboard" className="text-slate-600 hover:text-slate-900">My Dashboard</Link>
            {user.role !== "student" && (
              <Link to="/teacher" className="text-slate-600 hover:text-slate-900">Teacher Console</Link>
            )}
          </>
        )}
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <span className="text-slate-500 text-sm">{user.username} • {user.role}</span>
              <button onClick={logout} className="px-3 py-1.5 rounded-md bg-slate-900 text-white text-sm">Logout</button>
            </>
          ) : (
            <Link to="/login" className="px-3 py-1.5 rounded-md bg-slate-900 text-white text-sm">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}
