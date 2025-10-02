import { useEffect, useState } from "react";
import { getLabs, type Lab } from "../api/mock";
import { Link } from "react-router-dom";

export default function Catalog() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => { getLabs().then(setLabs); }, []);
  const filtered = labs.filter(l => l.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Lab Catalog</h1>
        <input className="ml-auto border rounded-md px-3 py-1.5" placeholder="Search labs..." value={q} onChange={e=>setQ(e.target.value)} />
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {filtered.map(l => (
          <div key={l.id} className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="text-lg font-medium">{l.name}</div>
            <div className="text-sm text-slate-600">{l.description}</div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs px-2 py-1 rounded bg-slate-100">{l.level}</span>
              <Link to={`/labs/${l.id}`} className="px-3 py-1.5 rounded-md bg-slate-900 text-white text-sm">Start</Link>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-slate-500">No labs match your filters.</p>}
    </div>
  );
}
