export default function Dashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">My Dashboard</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <div className="font-medium mb-2">In progress</div>
          <ul className="text-sm list-disc ml-5">
            <li>Linux Basics — 40%</li>
            <li>Kubernetes Intro — 10%</li>
          </ul>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="font-medium mb-2">Recent submissions</div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500"><th>Lab</th><th>Score</th><th>Date</th></tr></thead>
            <tbody>
              <tr><td>Bash 101</td><td>85</td><td>2025-01-05</td></tr>
              <tr><td>Files 101</td><td>92</td><td>2025-01-03</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
