import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminGamificationDashboard,
  updateAdminCapsule,
  updateAdminConstellation,
  type AdminCapsule,
  type AdminConstellation,
} from "@/api/adminGamification";
import { api } from "@/api";
import DashboardCard from "@/components/ui/DashboardCard";
import ConstellationArtwork from "@/components/gamification/ConstellationArtwork";
import { ALT_COLORS } from "@/lib/theme";

const RARITY_OPTIONS = ["common", "rare", "epic", "legendary"] as const;
const HEMISPHERE_OPTIONS = ["northern", "southern", "both", "unknown"] as const;
const ORION_ITEM_CODE = "constellation-orion";
const ORION_LEGENDARY_IMAGE = "constellations/orion-rare.png";

type OrionPreviewStage = "base" | "legendary";

type AdminTemplate = {
  id: string;
  name: string;
  description: string;
  stepsCount: number;
  updatedAt: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function normalizeTemplate(raw: {
  lab_id?: string;
  id?: string;
  template_id?: string;
  name?: string;
  description?: string | null;
  steps_count?: number | null;
  updated_at?: string | null;
  updatedAt?: string | null;
}): AdminTemplate {
  return {
    id: raw.lab_id ?? raw.id ?? raw.template_id ?? "unknown",
    name: raw.name ?? "Untitled Template",
    description: raw.description ?? "No description",
    stepsCount: raw.steps_count ?? 0,
    updatedAt: raw.updated_at ?? raw.updatedAt ?? "Unknown",
  };
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <DashboardCard className="border border-white/10 bg-black/35 p-5 backdrop-blur-md">
      <p className="text-xs uppercase tracking-[0.24em] text-white/35">{label}</p>
      <p className="mt-2 text-3xl font-semibold" style={{ color: tone }}>
        {value}
      </p>
    </DashboardCard>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [capsules, setCapsules] = useState<AdminCapsule[]>([]);
  const [constellations, setConstellations] = useState<AdminConstellation[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [gamificationLoading, setGamificationLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingCapsule, setSavingCapsule] = useState<string | null>(null);
  const [savingConstellation, setSavingConstellation] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [orionPreviewStage, setOrionPreviewStage] =
    useState<OrionPreviewStage>("base");

  useEffect(() => {
    let cancelled = false;

    async function loadTemplates() {
      try {
        const raw = await api.getLabs();
        if (!cancelled) {
          setTemplates(raw.map(normalizeTemplate));
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setTemplatesError(getErrorMessage(err, "Could not load lab templates."));
        }
      } finally {
        if (!cancelled) {
          setTemplatesLoading(false);
        }
      }
    }

    loadTemplates();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getAdminGamificationDashboard();
        if (cancelled) {
          return;
        }

        setCapsules(data.capsules);
        setConstellations(data.constellations);
        setSelectedCode((current) => current ?? data.constellations[0]?.item_code ?? null);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Could not load admin gamification data."));
        }
      } finally {
        if (!cancelled) {
          setGamificationLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedConstellation = useMemo(
    () =>
      constellations.find((item) => item.item_code === selectedCode) ??
      constellations[0] ??
      null,
    [constellations, selectedCode],
  );

  const isOrionSelected = selectedConstellation?.item_code === ORION_ITEM_CODE;
  const previewImageUrl =
    isOrionSelected && orionPreviewStage === "legendary"
      ? ORION_LEGENDARY_IMAGE
      : selectedConstellation?.image_url ?? "";

  useEffect(() => {
    if (!isOrionSelected) {
      setOrionPreviewStage("base");
    }
  }, [isOrionSelected]);

  const summary = {
    capsuleCount: capsules.length,
    constellationCount: constellations.length,
    activeConstellationCount: constellations.filter((item) => item.is_active).length,
  };

  const updateCapsuleField = (
    capsuleType: string,
    field: keyof AdminCapsule,
    value: string | number | boolean,
  ) => {
    setCapsules((current) =>
      current.map((capsule) =>
        capsule.capsule_type === capsuleType
          ? { ...capsule, [field]: value }
          : capsule,
      ),
    );
  };

  const updateConstellationField = (
    itemCode: string,
    field: keyof AdminConstellation,
    value: string | number | boolean,
  ) => {
    setConstellations((current) =>
      current.map((item) =>
        item.item_code === itemCode ? { ...item, [field]: value } : item,
      ),
    );
  };

  const saveCapsule = async (capsule: AdminCapsule) => {
    setSavingCapsule(capsule.capsule_type);
    setFeedback(null);
    setError(null);

    try {
      const res = await updateAdminCapsule(capsule.capsule_type, capsule);
      setCapsules((current) =>
        current.map((entry) =>
          entry.capsule_type === res.capsule.capsule_type ? res.capsule : entry,
        ),
      );
      setFeedback(`Capsule "${capsule.capsule_type}" saved.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not save capsule."));
    } finally {
      setSavingCapsule(null);
    }
  };

  const saveConstellation = async (item: AdminConstellation) => {
    setSavingConstellation(item.item_code);
    setFeedback(null);
    setError(null);

    try {
      const res = await updateAdminConstellation(item.item_code, item);
      setConstellations((current) =>
        current.map((entry) =>
          entry.item_code === res.constellation.item_code ? res.constellation : entry,
        ),
      );
      setFeedback(`Constellation "${item.name}" saved.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not save constellation."));
    } finally {
      setSavingConstellation(null);
    }
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((template) => template.id !== id));
  };

  if (templatesLoading && gamificationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-white">
        <div className="animate-pulse text-white/50">Loading admin workspace...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#0B0F19] px-8 py-10 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-500/12 via-purple-500/8 to-transparent blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.36em] text-white/35">
              Admin workspace
            </p>
            <h1
              className="text-4xl font-bold"
              style={{
                background: `linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Gamification Control Room
            </h1>
            <p className="max-w-2xl text-sm text-white/45">
              Manage lab templates, tune the capsule machine, and edit constellation content without touching code.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/learner/gacha")}
              className="rounded-2xl border border-white/15 bg-black/20 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/25 hover:text-white"
            >
              Open Gacha Preview
            </button>
            <button
              onClick={() => navigate("/learner/collection")}
              className="rounded-2xl bg-gradient-to-r from-sky-500 via-purple-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Open Collection Preview
            </button>
          </div>
        </div>

        <DashboardCard className="space-y-5 border border-white/10 bg-black/35 p-6 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-semibold text-purple-300">
              Lab Template Management
            </h2>
            <p className="mt-1 text-sm text-white/40">
              Existing admin workspace for monitoring and managing available lab templates.
            </p>
          </div>

          {templatesLoading ? (
            <p className="text-sm italic text-white/40">Loading lab templates...</p>
          ) : templatesError ? (
            <p className="text-sm text-red-200">{templatesError}</p>
          ) : templates.length === 0 ? (
            <p className="text-sm italic text-white/40">No lab templates found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 text-white/40">
                  <tr>
                    <th className="py-2">Name</th>
                    <th className="py-2">Steps</th>
                    <th className="py-2">Updated</th>
                    <th className="py-2 pr-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {templates.map((template) => (
                    <tr key={template.id} className="border-b border-white/5">
                      <td className="py-3 text-white">{template.name}</td>
                      <td className="py-3 text-white/70">{template.stepsCount}</td>
                      <td className="py-3 text-white/70">{template.updatedAt}</td>
                      <td className="flex justify-end gap-3 py-3 pr-4">
                        <button
                          className="rounded bg-purple-600 px-3 py-1 text-xs text-white transition hover:bg-purple-500"
                          onClick={() => alert("Edit coming soon")}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded bg-red-600 px-3 py-1 text-xs text-white transition hover:bg-red-500"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DashboardCard>

        {gamificationLoading ? (
          <DashboardCard className="border border-white/10 bg-black/35 p-6 text-sm text-white/40 backdrop-blur-md">
            Loading gamification control room...
          </DashboardCard>
        ) : (
          <>
        <div className="grid gap-4 md:grid-cols-3">
          <StatTile
            label="Capsules"
            value={summary.capsuleCount.toString()}
            tone={ALT_COLORS.blue}
          />
          <StatTile
            label="Constellations"
            value={summary.constellationCount.toString()}
            tone={ALT_COLORS.purple}
          />
          <StatTile
            label="Active In Gacha"
            value={summary.activeConstellationCount.toString()}
            tone={ALT_COLORS.orange}
          />
        </div>

        {(error || feedback) && (
          <DashboardCard
            className={[
              "border p-4 backdrop-blur-md",
              error
                ? "border-red-500/30 bg-red-500/10 text-red-200"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
            ].join(" ")}
          >
            {error ?? feedback}
          </DashboardCard>
        )}

        <DashboardCard className="space-y-5 border border-white/10 bg-black/35 p-6 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-semibold text-sky-300">Capsule tuning</h2>
            <p className="mt-1 text-sm text-white/40">
              Update pricing, drop rates, pity, and activation state for each capsule.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {capsules.map((capsule) => (
              <div
                key={capsule.capsule_type}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                      Capsule
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-white">
                      {capsule.capsule_type}
                    </h3>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-white/60">
                    <input
                      type="checkbox"
                      checked={capsule.is_active}
                      onChange={(e) =>
                        updateCapsuleField(
                          capsule.capsule_type,
                          "is_active",
                          e.target.checked,
                        )
                      }
                    />
                    Active
                  </label>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    ["Price", "price_starlight"],
                    ["Common", "common_rate"],
                    ["Rare", "rare_rate"],
                    ["Epic", "epic_rate"],
                    ["Legendary", "legendary_rate"],
                    ["Rare pity", "rare_pity_threshold"],
                    ["Epic pity", "epic_pity_threshold"],
                  ].map(([label, field]) => (
                    <label key={field} className="space-y-1 text-sm text-white/60">
                      <span>{label}</span>
                      <input
                        type="number"
                        value={capsule[field as keyof AdminCapsule] as number}
                        onChange={(e) =>
                          updateCapsuleField(
                            capsule.capsule_type,
                            field as keyof AdminCapsule,
                            Number(e.target.value),
                          )
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#121726] px-3 py-2 text-white outline-none transition focus:border-sky-400/50"
                      />
                    </label>
                  ))}
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => saveCapsule(capsule)}
                    disabled={savingCapsule === capsule.capsule_type}
                    className="rounded-2xl bg-gradient-to-r from-sky-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingCapsule === capsule.capsule_type ? "Saving..." : "Save capsule"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <DashboardCard className="border border-white/10 bg-black/35 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-purple-300">Constellations</h2>
                <p className="mt-1 text-sm text-white/40">
                  Choose an item to edit its gacha and collection content.
                </p>
              </div>
            </div>

            <div className="mt-5 max-h-[780px] space-y-2 overflow-y-auto pr-1">
              {constellations.map((item) => {
                const isActive = item.item_code === selectedConstellation?.item_code;

                return (
                  <button
                    key={item.item_code}
                    onClick={() => setSelectedCode(item.item_code)}
                    className={[
                      "w-full rounded-2xl border px-4 py-3 text-left transition",
                      isActive
                        ? "border-purple-400/60 bg-purple-400/10"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{item.name}</p>
                        <p className="truncate text-xs uppercase tracking-[0.18em] text-white/35">
                          {item.rarity} - {item.capsule_type}
                        </p>
                      </div>
                      <span
                        className={[
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]",
                          item.is_active
                            ? "bg-emerald-400/15 text-emerald-200"
                            : "bg-white/10 text-white/45",
                        ].join(" ")}
                      >
                        {item.is_active ? "Live" : "Hidden"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </DashboardCard>

          <DashboardCard className="border border-white/10 bg-black/35 p-6 backdrop-blur-md">
            {!selectedConstellation ? (
              <div className="flex min-h-[420px] items-center justify-center text-white/40">
                No constellation selected.
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/25">
                    <ConstellationArtwork
                      imageUrl={previewImageUrl}
                      alt={selectedConstellation.name}
                      imageClassName="aspect-square w-full object-cover"
                      containerClassName="aspect-square w-full"
                      fallbackClassName="bg-black/10"
                      fallbackSymbolClassName="text-7xl text-white/25"
                    />
                  </div>

                  {isOrionSelected && (
                    <div className="rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-amber-100/55">
                        Orion evolution preview
                      </p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {[
                          ["base", "3-star Base"],
                          ["legendary", "4-star to 6-star Legendary"],
                        ].map(([stage, label]) => (
                          <button
                            key={stage}
                            type="button"
                            onClick={() =>
                              setOrionPreviewStage(stage as OrionPreviewStage)
                            }
                            className={[
                              "rounded-2xl border px-3 py-2 text-sm font-semibold transition",
                              orionPreviewStage === stage
                                ? "border-amber-200/60 bg-amber-300/15 text-amber-100"
                                : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white",
                            ].join(" ")}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <p className="mt-3 text-xs leading-5 text-white/40">
                        Preview only: the collection and gacha automatically use
                        the evolved image when Orion reaches 4 stars or higher.
                      </p>
                    </div>
                  )}

                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                      Preview path
                    </p>
                    <p className="mt-2 break-all text-sm text-white/70">
                      {previewImageUrl || "No asset path yet"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1 text-sm text-white/60">
                      <span>Name</span>
                      <input
                        value={selectedConstellation.name}
                        onChange={(e) =>
                          updateConstellationField(
                            selectedConstellation.item_code,
                            "name",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#121726] px-3 py-2 text-white outline-none transition focus:border-sky-400/50"
                      />
                    </label>

                    <label className="space-y-1 text-sm text-white/60">
                      <span>Rarity</span>
                      <select
                        value={selectedConstellation.rarity}
                        onChange={(e) =>
                          updateConstellationField(
                            selectedConstellation.item_code,
                            "rarity",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#121726] px-3 py-2 text-white outline-none transition focus:border-sky-400/50"
                      >
                        {RARITY_OPTIONS.map((rarity) => (
                          <option key={rarity} value={rarity}>
                            {rarity}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1 text-sm text-white/60">
                      <span>Hemisphere</span>
                      <select
                        value={selectedConstellation.hemisphere}
                        onChange={(e) =>
                          updateConstellationField(
                            selectedConstellation.item_code,
                            "hemisphere",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#121726] px-3 py-2 text-white outline-none transition focus:border-sky-400/50"
                      >
                        {HEMISPHERE_OPTIONS.map((hemisphere) => (
                          <option key={hemisphere} value={hemisphere}>
                            {hemisphere}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1 text-sm text-white/60">
                      <span>Weight</span>
                      <input
                        type="number"
                        value={selectedConstellation.weight}
                        onChange={(e) =>
                          updateConstellationField(
                            selectedConstellation.item_code,
                            "weight",
                            Number(e.target.value),
                          )
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#121726] px-3 py-2 text-white outline-none transition focus:border-sky-400/50"
                      />
                    </label>

                    <label className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
                      <input
                        type="checkbox"
                        checked={selectedConstellation.is_active}
                        onChange={(e) =>
                          updateConstellationField(
                            selectedConstellation.item_code,
                            "is_active",
                            e.target.checked,
                          )
                        }
                      />
                      Visible in gacha
                    </label>
                  </div>

                  <label className="space-y-1 text-sm text-white/60">
                    <span>Asset path</span>
                    <input
                      value={selectedConstellation.image_url}
                      onChange={(e) =>
                        updateConstellationField(
                          selectedConstellation.item_code,
                          "image_url",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-2xl border border-white/10 bg-[#121726] px-3 py-2 text-white outline-none transition focus:border-sky-400/50"
                    />
                  </label>

                  <label className="space-y-1 text-sm text-white/60">
                    <span>Collection subtitle</span>
                    <input
                      value={selectedConstellation.description_short}
                      onChange={(e) =>
                        updateConstellationField(
                          selectedConstellation.item_code,
                          "description_short",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-2xl border border-white/10 bg-[#121726] px-3 py-2 text-white outline-none transition focus:border-sky-400/50"
                    />
                  </label>

                  <label className="space-y-1 text-sm text-white/60">
                    <span>Description</span>
                    <textarea
                      value={selectedConstellation.description_full}
                      onChange={(e) =>
                        updateConstellationField(
                          selectedConstellation.item_code,
                          "description_full",
                          e.target.value,
                        )
                      }
                      rows={4}
                      className="w-full rounded-2xl border border-white/10 bg-[#121726] px-3 py-2 text-white outline-none transition focus:border-sky-400/50"
                    />
                  </label>

                  <label className="space-y-1 text-sm text-white/60">
                    <span>Location</span>
                    <input
                      value={selectedConstellation.location_label}
                      onChange={(e) =>
                        updateConstellationField(
                          selectedConstellation.item_code,
                          "location_label",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-2xl border border-white/10 bg-[#121726] px-3 py-2 text-white outline-none transition focus:border-sky-400/50"
                    />
                  </label>

                  <label className="space-y-1 text-sm text-white/60">
                    <span>History</span>
                    <textarea
                      value={selectedConstellation.history_text}
                      onChange={(e) =>
                        updateConstellationField(
                          selectedConstellation.item_code,
                          "history_text",
                          e.target.value,
                        )
                      }
                      rows={5}
                      className="w-full rounded-2xl border border-white/10 bg-[#121726] px-3 py-2 text-white outline-none transition focus:border-sky-400/50"
                    />
                  </label>

                  <label className="space-y-1 text-sm text-white/60">
                    <span>Technical details</span>
                    <textarea
                      value={selectedConstellation.technical_details}
                      onChange={(e) =>
                        updateConstellationField(
                          selectedConstellation.item_code,
                          "technical_details",
                          e.target.value,
                        )
                      }
                      rows={5}
                      className="w-full rounded-2xl border border-white/10 bg-[#121726] px-3 py-2 text-white outline-none transition focus:border-sky-400/50"
                    />
                  </label>

                  <label className="space-y-1 text-sm text-white/60">
                    <span>Legend text</span>
                    <textarea
                      value={selectedConstellation.legend_text}
                      onChange={(e) =>
                        updateConstellationField(
                          selectedConstellation.item_code,
                          "legend_text",
                          e.target.value,
                        )
                      }
                      rows={5}
                      className="w-full rounded-2xl border border-white/10 bg-[#121726] px-3 py-2 text-white outline-none transition focus:border-sky-400/50"
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1 text-sm text-white/60">
                      <span>Official image URL</span>
                      <input
                        value={selectedConstellation.nasa_image_url}
                        onChange={(e) =>
                          updateConstellationField(
                            selectedConstellation.item_code,
                            "nasa_image_url",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#121726] px-3 py-2 text-white outline-none transition focus:border-sky-400/50"
                      />
                    </label>

                    <label className="space-y-1 text-sm text-white/60">
                      <span>Official image title</span>
                      <input
                        value={selectedConstellation.nasa_image_title}
                        onChange={(e) =>
                          updateConstellationField(
                            selectedConstellation.item_code,
                            "nasa_image_title",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#121726] px-3 py-2 text-white outline-none transition focus:border-sky-400/50"
                      />
                    </label>
                  </div>

                  <label className="space-y-1 text-sm text-white/60">
                    <span>Official image description</span>
                    <textarea
                      value={selectedConstellation.nasa_image_description}
                      onChange={(e) =>
                        updateConstellationField(
                          selectedConstellation.item_code,
                          "nasa_image_description",
                          e.target.value,
                        )
                      }
                      rows={4}
                      className="w-full rounded-2xl border border-white/10 bg-[#121726] px-3 py-2 text-white outline-none transition focus:border-sky-400/50"
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1 text-sm text-white/60">
                      <span>Astronomy source URL</span>
                      <input
                        value={selectedConstellation.astronomy_source_url}
                        onChange={(e) =>
                          updateConstellationField(
                            selectedConstellation.item_code,
                            "astronomy_source_url",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#121726] px-3 py-2 text-white outline-none transition focus:border-sky-400/50"
                      />
                    </label>

                    <label className="space-y-1 text-sm text-white/60">
                      <span>Legend source URL</span>
                      <input
                        value={selectedConstellation.mythology_source_url}
                        onChange={(e) =>
                          updateConstellationField(
                            selectedConstellation.item_code,
                            "mythology_source_url",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#121726] px-3 py-2 text-white outline-none transition focus:border-sky-400/50"
                      />
                    </label>
                  </div>

                  <label className="space-y-1 text-sm text-white/60">
                    <span>Official image source URL</span>
                    <input
                      value={selectedConstellation.nasa_source_url}
                      onChange={(e) =>
                        updateConstellationField(
                          selectedConstellation.item_code,
                          "nasa_source_url",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-2xl border border-white/10 bg-[#121726] px-3 py-2 text-white outline-none transition focus:border-sky-400/50"
                    />
                  </label>

                  <div className="flex justify-end">
                    <button
                      onClick={() => saveConstellation(selectedConstellation)}
                      disabled={savingConstellation === selectedConstellation.item_code}
                      className="rounded-2xl bg-gradient-to-r from-purple-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingConstellation === selectedConstellation.item_code
                        ? "Saving..."
                        : "Save constellation"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </DashboardCard>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
