import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import { getLab, type Lab } from "../api/mock";

const mockStepsHtml = `
  <h3 class="font-semibold mb-2">Steps</h3>
  <ol class="list-decimal ml-5 space-y-1">
    <li>Create a new user: <code>adduser alice</code></li>
    <li>Verify: <code>id alice</code></li>
    <li>Submit the result when done.</li>
  </ol>
`;

export default function Lab() {
  const { id } = useParams();
  const [lab, setLab] = useState<Lab | undefined>();

  useEffect(() => { getLab(Number(id)).then(setLab); }, [id]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{lab?.name ?? "Loading..."}</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white border rounded-xl p-4">
          <div
            className="prose prose-sm"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(mockStepsHtml) }}
          />
          <div className="mt-4 flex gap-2">
            <button className="px-3 py-1.5 rounded-md bg-green-600 text-white text-sm">Submit results</button>
            <button className="px-3 py-1.5 rounded-md bg-slate-700 text-white text-sm">End lab</button>
          </div>
        </div>
        <div className="md:col-span-2 bg-white border rounded-xl p-4">
          <div className="text-sm text-slate-500 mb-2">Terminal (placeholder)</div>
          <div className="h-80 bg-black/90 rounded-md text-green-300 font-mono p-3 overflow-auto">
            $ echo "hello from your ephemeral lab"
          </div>
        </div>
      </div>
    </div>
  );
}
