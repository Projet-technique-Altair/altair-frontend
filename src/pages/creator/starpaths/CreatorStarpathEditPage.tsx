import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Globe,
  Loader2,
  Lock,
  Orbit,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { api } from "@/api";
import { getLab } from "@/api/labs";
import {
  addStarpathLab,
  deleteStarpathLab,
  getStarpath,
  getStarpathLabs,
  updateStarpath,
} from "@/api/starpaths";
import type { SearchLabResult } from "@/api/types";

type StarpathDifficulty = "beginner" | "intermediate" | "advanced";
type StarpathVisibility = "PRIVATE" | "PUBLIC";

type StarpathRecord = {
  starpath_id: string;
  name: string;
  description?: string | null;
  difficulty?: StarpathDifficulty | string | null;
  visibility?: StarpathVisibility | string | null;
};

type EnrichedLab = {
  lab_id: string;
  name: string;
  position: number;
};

type BusyAction =
  | "save-starpath"
  | "add-labs"
  | "delete-starpath"
  | null;

type MutationMessage = {
  type: "success" | "error";
  text: string;
} | null;

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-white/58">
      <span>{children}</span>
      {required && <span className="text-[10px] text-sky-300/80">Required</span>}
    </label>
  );
}

function FieldHint({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-xs leading-relaxed text-white/46">{children}</p>;
}

function InputShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-black/20 p-4 transition focus-within:border-sky-400/40 focus-within:bg-white/[0.055] focus-within:shadow-[0_0_0_1px_rgba(56,189,248,0.16)] ${className}`}
    >
      {children}
    </div>
  );
}

function SummaryPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Orbit;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-white/45">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <div className="mt-2 text-sm font-medium text-white/86">{value}</div>
    </div>
  );
}

function SelectCard({
  active,
  title,
  description,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  icon: typeof Globe;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? "border-sky-400/40 bg-white/[0.06] shadow-[0_0_30px_rgba(56,189,248,0.08)]"
          : "border-white/10 bg-black/20 hover:border-white/15 hover:bg-white/[0.04]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 rounded-xl border p-2 ${
            active
              ? "border-sky-400/30 bg-sky-400/10 text-sky-200"
              : "border-white/10 bg-white/[0.03] text-white/62"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <div className="text-sm font-semibold text-white/88">{title}</div>
          <div className="mt-1 text-xs leading-relaxed text-white/50">
            {description}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function CreatorStarpathEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [starpath, setStarpath] = useState<StarpathRecord | null>(null);
  const [labs, setLabs] = useState<EnrichedLab[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<StarpathDifficulty>("beginner");
  const [visibility, setVisibility] = useState<StarpathVisibility>("PRIVATE");

  const [labQuery, setLabQuery] = useState("");
  const [labResults, setLabResults] = useState<SearchLabResult[]>([]);
  const [selectedLabs, setSelectedLabs] = useState<SearchLabResult[]>([]);
  const [searchingLabs, setSearchingLabs] = useState(false);

  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [rowBusyId, setRowBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<MutationMessage>(null);

  const isBusy = busyAction !== null;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) {
        navigate("/creator/workspace", { replace: true });
        return;
      }

      setLoading(true);
      setMessage(null);

      try {
        const [starpathData, starpathLabs] = await Promise.all([
          getStarpath(id),
          getStarpathLabs(id),
        ]);

        const enrichedLabs = await Promise.all(
          (starpathLabs ?? []).map(async (lab: any) => {
            try {
              const fullLab = await getLab(lab.lab_id);
              return {
                ...lab,
                name: fullLab?.name || "Unknown lab",
                position: typeof lab.position === "number" ? lab.position : 0,
              } as EnrichedLab;
            } catch {
              return {
                ...lab,
                name: "Unknown lab",
                position: typeof lab.position === "number" ? lab.position : 0,
              } as EnrichedLab;
            }
          }),
        );

        if (cancelled) return;

        const sortedLabs = [...enrichedLabs].sort(
          (left, right) => left.position - right.position,
        );

        const starpathRecord = starpathData as StarpathRecord;

        setStarpath(starpathRecord);
        setLabs(sortedLabs);

        setName(starpathRecord.name ?? "");
        setDescription(starpathRecord.description ?? "");
        setDifficulty(
          starpathRecord.difficulty === "intermediate"
            ? "intermediate"
            : starpathRecord.difficulty === "advanced"
              ? "advanced"
              : "beginner",
        );
        setVisibility(starpathRecord.visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE");
      } catch (error) {
        console.error("Failed to load starpath:", error);

        if (!cancelled) {
          setMessage({
            type: "error",
            text: "Failed to load this starpath.",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  useEffect(() => {
    let cancelled = false;

    if (labQuery.trim().length < 2) {
      setLabResults([]);
      setSearchingLabs(false);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setSearchingLabs(true);

      try {
        const results = await api.searchLabs(labQuery.trim().slice(0, 80));

        if (cancelled) return;
        setLabResults(results ?? []);
      } catch (error) {
        console.error("Failed to search labs:", error);

        if (!cancelled) {
          setLabResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearchingLabs(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [labQuery]);

  const normalizedName = name.replace(/\s+/g, " ").trim();
  const normalizedDescription = description.trim();

  const completion = useMemo(() => {
    let filled = 0;
    const total = 2;

    if (normalizedName) filled += 1;
    if (normalizedDescription) filled += 1;

    return Math.round((filled / total) * 100);
  }, [normalizedDescription, normalizedName]);

  const labResultsFiltered = labResults.filter(
    (lab) =>
      !selectedLabs.some((selected) => selected.lab_id === lab.lab_id) &&
      !labs.some((assigned) => assigned.lab_id === lab.lab_id),
  );

  const handleSaveStarpath = async () => {
    if (!id || busyAction) return;

    if (!normalizedName) {
      setMessage({
        type: "error",
        text: "Starpath name cannot be empty.",
      });
      return;
    }

    setBusyAction("save-starpath");
    setMessage(null);

    try {
      const updated = await updateStarpath(id, {
        name: normalizedName,
        description: normalizedDescription,
        difficulty,
        visibility,
      });

      const nextStarpath = updated as StarpathRecord;
      setStarpath(nextStarpath);
      setName(nextStarpath.name ?? normalizedName);
      setDescription(nextStarpath.description ?? normalizedDescription);
      setDifficulty(
        nextStarpath.difficulty === "intermediate"
          ? "intermediate"
          : nextStarpath.difficulty === "advanced"
            ? "advanced"
            : "beginner",
      );
      setVisibility(nextStarpath.visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE");

      setMessage({
        type: "success",
        text: "Starpath details saved successfully.",
      });
    } catch (error) {
      console.error("Failed to update starpath:", error);
      setMessage({
        type: "error",
        text: "Failed to save starpath details.",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleConfirmLabs = async () => {
    if (!id || busyAction || selectedLabs.length === 0) return;

    setBusyAction("add-labs");
    setMessage(null);

    try {
      let position = labs.length;

      for (const lab of selectedLabs) {
        await addStarpathLab(id, {
          lab_id: lab.lab_id,
          position,
        });
        position += 1;
      }

      const nextLabs: EnrichedLab[] = selectedLabs.map((lab, index) => ({
        lab_id: lab.lab_id,
        name: lab.name || "Unknown lab",
        position: labs.length + index,
      }));

      setLabs((prev) => [...prev, ...nextLabs]);
      setSelectedLabs([]);
      setLabQuery("");
      setLabResults([]);

      setMessage({
        type: "success",
        text: "Selected labs added successfully.",
      });
    } catch (error) {
      console.error("Failed to add labs:", error);
      setMessage({
        type: "error",
        text: "Failed to add selected labs.",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleRemoveLab = async (labId: string) => {
    if (!id || isBusy || rowBusyId) return;

    setRowBusyId(labId);
    setMessage(null);

    try {
      await deleteStarpathLab(id, labId);

      setLabs((prev) =>
        prev
          .filter((lab) => lab.lab_id !== labId)
          .map((lab, index) => ({
            ...lab,
            position: index,
          })),
      );

      setMessage({
        type: "success",
        text: "Lab removed from the starpath.",
      });
    } catch (error) {
      console.error("Failed to remove lab:", error);
      setMessage({
        type: "error",
        text: "Failed to remove this lab.",
      });
    } finally {
      setRowBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!id || busyAction) return;

    setBusyAction("delete-starpath");
    setMessage(null);

    try {
      await api.deleteStarpath(id);
      navigate("/creator/workspace");
    } catch (error) {
      console.error("Failed to delete starpath:", error);
      setConfirmDelete(false);
      setMessage({
        type: "error",
        text: "Failed to delete this starpath.",
      });
    } finally {
      setBusyAction(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full text-white">
        <div className="mx-auto w-full max-w-[1680px] px-6 py-10 xl:px-10 2xl:px-14">
          <div className="animate-pulse">
            <div className="h-5 w-24 rounded bg-white/10" />
            <div className="mt-6 h-3 w-28 rounded bg-white/10" />
            <div className="mt-3 h-10 w-72 rounded bg-white/10" />
            <div className="mt-4 h-5 w-[32rem] max-w-full rounded bg-white/10" />

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:max-w-[720px]">
              <div className="h-20 rounded-2xl border border-white/10 bg-white/5" />
              <div className="h-20 rounded-2xl border border-white/10 bg-white/5" />
              <div className="h-20 rounded-2xl border border-white/10 bg-white/5" />
            </div>

            <div className="mt-8 h-px w-full bg-white/10" />

            <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
              <div className="space-y-6 xl:col-span-8">
                <div className="h-72 rounded-3xl border border-white/10 bg-white/5" />
                <div className="h-72 rounded-3xl border border-white/10 bg-white/5" />
              </div>
              <div className="xl:col-span-4">
                <div className="h-[34rem] rounded-3xl border border-white/10 bg-white/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const difficultyLabel =
    difficulty === "beginner"
      ? "Beginner"
      : difficulty === "intermediate"
        ? "Intermediate"
        : "Advanced";

  const visibilityLabel = visibility === "PUBLIC" ? "Public" : "Private";

  return (
    <div className="min-h-screen w-full text-white">
      <div className="mx-auto w-full max-w-[1680px] px-6 py-10 xl:px-10 2xl:px-14">
        <div>
          <button
            onClick={() => navigate(`/creator/starpath/${id}`)}
            className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white/80"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="mt-5 text-[11px] uppercase tracking-[0.22em] text-white/45">
            Creator starpath
          </div>

          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white/92 sm:text-4xl">
                Edit starpath
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
                Update the starpath identity, configuration, and linked labs while keeping the creator flow consistent.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <SummaryPill icon={Orbit} label="Labs" value={`${labs.length}`} />
              <SummaryPill icon={Sparkles} label="Difficulty" value={difficultyLabel} />
              <SummaryPill icon={Save} label="Completion" value={`${completion}%`} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSaveStarpath}
              disabled={busyAction === "save-starpath"}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-sky-400/40 hover:bg-white/5 hover:shadow-[0_0_40px_rgba(56,189,248,0.25)] active:scale-[0.98] ${
                busyAction === "save-starpath" ? "cursor-not-allowed opacity-60" : ""
              }`}
              type="button"
            >
              {busyAction === "save-starpath" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving changes…</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save changes</span>
                </>
              )}
            </button>

            <button
              onClick={() => navigate(`/creator/starpath/${id}/analytics`)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/82 transition hover:border-emerald-400/40 hover:bg-white/5"
              type="button"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </button>
          </div>

          {message && (
            <div
              className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
                message.type === "success"
                  ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                  : "border-red-400/20 bg-red-500/10 text-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="mt-6 h-px w-full bg-white/10" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Starpath content
              </div>

              <div className="mt-4 space-y-4">
                <InputShell>
                  <FieldLabel required>Name</FieldLabel>
                  <input
                    value={name}
                    onChange={(e) => {
                      setMessage(null);
                      setName(e.target.value.slice(0, 120));
                    }}
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                    placeholder="Starpath name"
                  />
                </InputShell>

                <InputShell>
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setMessage(null);
                      setDescription(e.target.value.slice(0, 2000));
                    }}
                    rows={5}
                    className="mt-3 w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-white/82 outline-none placeholder:text-white/28"
                    placeholder="Describe the purpose and progression of this starpath"
                  />
                </InputShell>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-white/50">
                    Labs
                  </div>
                  <div className="mt-2 text-sm text-white/60">
                    Manage the ordered list of labs in this starpath.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/55">
                  {labs.length} linked
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {labs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-white/50">
                    No labs linked yet. Add labs to define the first milestones of this starpath.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {labs.map((lab, index) => (
                      <div
                        key={lab.lab_id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="text-[11px] uppercase tracking-wide text-white/45">
                            Position {index + 1}
                          </div>
                          <div className="mt-1 truncate text-sm text-white/86">
                            {lab.name}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveLab(lab.lab_id)}
                          disabled={rowBusyId === lab.lab_id || isBusy}
                          className="shrink-0 text-xs font-medium text-red-300 transition hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <InputShell>
                  <FieldLabel>Add labs</FieldLabel>

                  <div className="mt-3 flex items-center gap-3">
                    <Search className="h-4 w-4 text-white/35" />
                    <input
                      placeholder="Search lab..."
                      value={labQuery}
                      onChange={(e) => {
                        setMessage(null);
                        setLabQuery(e.target.value.slice(0, 80));
                      }}
                      className="w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                    />
                  </div>

                  <FieldHint>
                    Search labs and add them to the pending selection before confirming.
                  </FieldHint>

                  {labQuery.trim().length >= 2 ? (
                    searchingLabs ? (
                      <div className="mt-3 flex items-center gap-2 text-sm text-white/45">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Searching labs…</span>
                      </div>
                    ) : (
                      <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                        {labResultsFiltered.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-white/50">
                            No available labs found.
                          </div>
                        ) : (
                          labResultsFiltered.map((lab) => (
                            <button
                              key={lab.lab_id}
                              onClick={() => setSelectedLabs((prev) => [...prev, lab])}
                              disabled={isBusy}
                              className="flex w-full items-center justify-between gap-3 border-b border-white/5 px-4 py-3 text-left text-sm text-white/82 transition last:border-b-0 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                              type="button"
                            >
                              <span className="truncate">{lab.name}</span>
                              <span className="text-[11px] uppercase tracking-wide text-white/35">
                                Add
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )
                  ) : null}
                </InputShell>

                {selectedLabs.length > 0 && (
                  <div className="space-y-3 rounded-2xl border border-white/10 bg-black/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[11px] uppercase tracking-wide text-white/45">
                        Pending labs
                      </div>
                      <div className="text-xs text-white/50">
                        {selectedLabs.length} selected
                      </div>
                    </div>

                    <div className="space-y-2">
                      {selectedLabs.map((lab) => (
                        <div
                          key={lab.lab_id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                        >
                          <div className="min-w-0 text-sm text-white/85">
                            <div className="truncate">{lab.name}</div>
                          </div>

                          <button
                            onClick={() =>
                              setSelectedLabs((prev) =>
                                prev.filter((entry) => entry.lab_id !== lab.lab_id),
                              )
                            }
                            disabled={isBusy}
                            className="shrink-0 text-xs font-medium text-red-300 transition hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleConfirmLabs}
                      disabled={busyAction === "add-labs"}
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-purple-400/30 hover:bg-white/5 ${
                        busyAction === "add-labs"
                          ? "cursor-not-allowed opacity-60"
                          : ""
                      }`}
                      type="button"
                    >
                      <Plus className="h-4 w-4" />
                      {busyAction === "add-labs" ? "Adding labs…" : "Add selected labs"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 xl:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md xl:sticky xl:top-6">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Configuration
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <FieldLabel>Difficulty</FieldLabel>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    <SelectCard
                      active={difficulty === "beginner"}
                      icon={Sparkles}
                      title="Beginner"
                      description="Introductory learning path."
                      onClick={() => setDifficulty("beginner")}
                    />
                    <SelectCard
                      active={difficulty === "intermediate"}
                      icon={Sparkles}
                      title="Intermediate"
                      description="More autonomous progression."
                      onClick={() => setDifficulty("intermediate")}
                    />
                    <SelectCard
                      active={difficulty === "advanced"}
                      icon={Sparkles}
                      title="Advanced"
                      description="Demanding and denser path."
                      onClick={() => setDifficulty("advanced")}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Visibility</FieldLabel>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    <SelectCard
                      active={visibility === "PRIVATE"}
                      icon={Lock}
                      title="Private"
                      description="Visible only in controlled creator or assigned flows."
                      onClick={() => setVisibility("PRIVATE")}
                    />
                    <SelectCard
                      active={visibility === "PUBLIC"}
                      icon={Globe}
                      title="Public"
                      description="Can be exposed to broader discovery and learner access."
                      onClick={() => setVisibility("PUBLIC")}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/86">
                    {visibility === "PUBLIC" ? (
                      <Globe className="h-4 w-4 text-emerald-300" />
                    ) : (
                      <Lock className="h-4 w-4 text-white/55" />
                    )}
                    <span>{visibilityLabel} starpath</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/58">
                    This starpath currently contains {labs.length} linked lab
                    {labs.length > 1 ? "s" : ""}.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-red-400/20 bg-red-500/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-red-200/80">
                <AlertTriangle className="h-3.5 w-3.5" />
                Danger zone
              </div>

              <p className="mt-3 text-sm leading-relaxed text-white/65">
                Deleting this starpath permanently removes the starpath and all current lab associations.
              </p>

              <button
                onClick={() => setConfirmDelete(true)}
                disabled={isBusy}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
              >
                <Trash2 className="h-4 w-4" />
                Delete starpath
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-white/92">
                  Delete this starpath?
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  This action cannot be undone.
                </p>
              </div>

              <button
                onClick={() => setConfirmDelete(false)}
                disabled={busyAction === "delete-starpath"}
                className="rounded-xl border border-white/10 p-2 text-white/60 transition hover:bg-white/5 hover:text-white/85 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={busyAction === "delete-starpath"}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={busyAction === "delete-starpath"}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/25 ${
                  busyAction === "delete-starpath"
                    ? "cursor-not-allowed opacity-60"
                    : ""
                }`}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
                {busyAction === "delete-starpath" ? "Deleting…" : "Delete starpath"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}