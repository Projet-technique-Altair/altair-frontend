import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardCard from "@/components/ui/DashboardCard";
import { ALT_COLORS } from "@/lib/theme";

import {
  getStarpath,
  getStarpathLabs,
  addStarpathLab,
  deleteStarpathLab,
  updateStarpath
} from "@/api/starpaths";

import { api } from "@/api";

export default function CreatorStarpathPage() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [starpath, setStarpath] = useState<any>(null);
  const [labs, setLabs] = useState<any[]>([]);

  const [labQuery, setLabQuery] = useState("");
  const [labResults, setLabResults] = useState<any[]>([]);
  const [selectedLabs, setSelectedLabs] = useState<any[]>([]);

  const [editing, setEditing] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "PUBLIC">("PRIVATE");

  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {

    async function load() {

      try {

        const s = await getStarpath(id!);
        const l = await getStarpathLabs(id!);

        setStarpath(s);
        setLabs(l);

        setName(s.name);
        setDescription(s.description ?? "");
        setDifficulty(s.difficulty ?? "");
        setVisibility(s.visibility ?? "PRIVATE");

      } catch (err) {
        console.error("Failed to load starpath:", err);
      } finally {
        setLoading(false);
      }

    }

    load();

  }, [id]);

  useEffect(() => {
    if (labQuery.length < 2) {
      setLabResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const labs = await api.searchLabs(labQuery);
        setLabResults(labs);
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [labQuery]);

  // ========================
  // UPDATE STARPATH
  // ========================

  const handleSaveStarpath = async () => {
    try {
      const updated = await updateStarpath(id!, {
        name,
        description,
        difficulty,
        visibility
      });

      setStarpath(updated);
      setEditing(false);

    } catch (err) {
      console.error("Failed to update starpath:", err);
    }
  };

  // ========================
  // ADD LABS
  // ========================

  const handleConfirmLabs = async () => {
    try {
      let position = labs.length;

      for (const lab of selectedLabs) {

        await addStarpathLab(id!, {
          lab_id: lab.lab_id,
          position
        });
        position++;
      }

      setLabs(prev => [...prev, ...selectedLabs]);

      setSelectedLabs([]);
      setLabQuery("");
      setLabResults([]);

    } catch (err) {
      console.error("Failed to add lab:", err);
    }

  };

  // ========================
  // REMOVE LAB
  // ========================

  const handleRemoveLab = async (labId: string) => {
    try {
      await deleteStarpathLab(id!, labId);

      setLabs(prev =>
        prev.filter(l => l.lab_id !== labId)
      );

    } catch (err) {
      console.error("Failed to remove lab:", err);
    }

  };


  // ========================
  // DELETE STARPATH
  // ========================
  const handleDelete = async () => {
    try {
        await api.deleteStarpath(id!);
        navigate("/creator/dashboard");

    } catch (err) {
        console.error("Failed to delete starpath:", err);
    }
    };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-white">
        Loading starpath...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white px-8 py-10 space-y-8">

      {/* HEADER */}

      <div className="flex justify-between items-start">

        <div>

          {editing ? (

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-3xl font-bold bg-transparent border-b border-white/20 outline-none"
            />

          ) : (

            <h1
              className="text-3xl font-bold"
              style={{
                background: `linear-gradient(90deg, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {starpath?.name}
            </h1>

          )}

          {editing ? (

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 w-full max-w-xl rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm"
            />

          ) : (

            <p className="text-white/50 text-sm mt-2">
              {starpath?.description || "No description"}
            </p>

          )}

          {editing ? (
            <>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="mt-2 rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <select
                value={visibility}
                onChange={(e) =>
                  setVisibility(e.target.value as "PRIVATE" | "PUBLIC")
                }
                className="mt-2 rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm"
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </>

          ) : (

            <div className="mt-1 space-y-1">

              <p className="text-white/40 text-sm">
                Difficulty: {starpath?.difficulty || "Not set"}
              </p>

              <span
                className={`text-xs px-3 py-1 rounded-full
                  ${starpath?.visibility === "public"
                    ? "bg-green-500/10 text-green-300 border border-green-400/30"
                    : "bg-purple-500/10 text-purple-300 border border-purple-400/30"
                  }`}
              >
                {starpath?.visibility}
              </span>

            </div>

          )}

        </div>

        <div className="flex items-center gap-4">

          <button
            onClick={() => navigate("/creator/dashboard")}
            className="text-white/60 hover:text-white transition text-sm"
          >
            ← Back to dashboard
          </button>

          {editing ? (

            <button
              onClick={handleSaveStarpath}
              className="px-4 py-2 rounded-xl border border-green-400/30 bg-green-500/10 text-green-200 text-sm hover:bg-green-500/20 transition"
            >
              Save
            </button>

          ) : (

            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 rounded-xl border border-sky-400/30 bg-sky-500/10 text-sky-200 text-sm hover:bg-sky-500/20 transition"
            >
              Edit
            </button>

          )}

        </div>

      </div>

      {/* LABS */}

      <DashboardCard className="p-6 space-y-4">

        <div className="text-lg text-sky-400 font-semibold">
          Labs in this starpath
        </div>

        {labs.length === 0 && (
          <p className="text-white/50 text-sm">
            No labs yet.
          </p>
        )}

        {labs.map(lab => (

          <div
            key={lab.lab_id}
            className="flex justify-between items-center bg-black/30 rounded-xl px-4 py-3"
          >

            <span>{lab.name}</span>

            <button
              onClick={() => handleRemoveLab(lab.lab_id)}
              className="text-red-400 text-xs"
            >
              Remove
            </button>

          </div>

        ))}

        <input
          placeholder="Search lab..."
          value={labQuery}
          onChange={(e) => setLabQuery(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm"
        />

        {labResults.map(lab => (

          <div
            key={lab.lab_id}
            onClick={() => {

              const alreadyAssigned =
                labs.some(l => l.lab_id === lab.lab_id);

              const alreadySelected =
                selectedLabs.some(l => l.lab_id === lab.lab_id);

              if (!alreadyAssigned && !alreadySelected) {
                setSelectedLabs(prev => [...prev, lab]);
              }

            }}
            className="px-4 py-2 text-sm hover:bg-white/10 cursor-pointer"
          >
            {lab.name}
          </div>

        ))}

        {selectedLabs.length > 0 && (

          <button
            onClick={handleConfirmLabs}
            className="px-4 py-2 rounded-xl bg-sky-500/20 text-sky-200 text-sm"
          >
            Confirm labs
          </button>

        )}

      </DashboardCard>
      <DashboardCard
        className="
        rounded-3xl
        border border-red-400/20
        bg-red-500/5
        backdrop-blur-xl
        p-6
        space-y-5
        max-w-xl
        "
        >

        <div className="text-red-300 font-semibold">
        Danger Zone
        </div>

        <div className="text-sm text-white/60 leading-relaxed">
        Deleting this starpath will permanently remove the starpath
        and all lab associations.
        </div>

        <button
        onClick={() => setConfirmDelete(true)}
        className="
        px-5 py-2
        rounded-xl
        border border-red-400/30
        bg-red-500/10
        text-red-200
        text-sm
        hover:bg-red-500/20
        transition
        "
        >
        Delete starpath
        </button>

        </DashboardCard>
        {confirmDelete && (

        <div
        className="
        fixed inset-0
        flex items-center justify-center
        bg-black/60
        backdrop-blur-sm
        "
        >

        <div
        className="
        bg-[#111827]
        border border-white/10
        rounded-2xl
        p-6
        space-y-5
        w-[420px]
        "
        >

        <div className="text-lg font-semibold">
        Delete this starpath?
        </div>

        <div className="text-sm text-white/60 leading-relaxed">
        This action cannot be undone.
        </div>

        <div className="flex justify-end gap-3 pt-2">

        <button
        onClick={() => setConfirmDelete(false)}
        className="
        px-4 py-2
        rounded-lg
        border border-white/10
        text-sm
        hover:bg-white/5
        "
        >
        Cancel
        </button>

        <button
        onClick={handleDelete}
        className="
        px-4 py-2
        rounded-lg
        border border-red-400/30
        bg-red-500/20
        text-red-200
        text-sm
        hover:bg-red-500/30
        "
        >
        Delete
        </button>

        </div>

        </div>

        </div>

        )}

    </div>
  );
}
