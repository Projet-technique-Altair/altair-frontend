export default function TeacherConsole() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Teacher Console</h1>
      <div className="bg-white border rounded-xl p-4">
        <div className="font-medium mb-2">Assignments</div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th>Lab</th><th>Group</th><th>Due</th><th>Actions</th></tr></thead>
          <tbody>
            <tr>
              <td>Linux Basics</td><td>Group A</td><td>2025-01-20</td>
              <td><button className="px-2 py-1 bg-slate-900 text-white rounded">View</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
