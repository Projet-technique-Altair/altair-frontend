/**
 * @file GroupsView
 *
 * Learner Groups view (list + detail) aligned with current Altair DA (glass / cosmic).
 *
 * Behavior:
 * - If URL has ?mock=1 -> uses local mock dataset (list + detail)
 * - Else -> expects "real" group minimal payload via navigation state:
 *   navigate(`/learner/groups/${group.id}`, { state: { group } })
 *
 * Routes recommended:
 * - /learner/groups
 * - /learner/groups/:id
 */

import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  Globe,
  Users,
  Layers,
  Orbit,
  Calendar,
  Tag,
  ChevronRight,
} from "lucide-react";

import { ALT_COLORS } from "@/lib/theme";

type GroupVisibility = "private" | "public";

type GroupLabRef = {
  id: string;
  name: string;
  status: "active" | "completed";
  progress?: number; // 0..100 (only meaningful for active)
};

type GroupStarpathRef = {
  id: string;
  name: string;
  chaptersCompleted: number;
  totalChapters: number;
  domain?: string;
};

type GroupMember = {
  name: string;
  role: "owner" | "member";
};

type GroupViewModel = {
  id: string;
  name: string;
  visibility: GroupVisibility;
  tagline?: string;

  // "Characteristics"
  tags: string[];
  createdAtISO?: string;

  members: GroupMember[];

  labs: GroupLabRef[];
  starpaths: GroupStarpathRef[];
};

type RealPrivateGroupMinimal = {
  id: string;
  name: string;
  labIds: string[];
  starpathIds: string[];
};

const MOCK_GROUPS: GroupViewModel[] = [
  {
    id: "grp-arcadia",
    name: "Arcadia Ops",
    visibility: "private",
    tagline: "Team workspace for coordinated ops & lab runs.",
    tags: ["ops", "linux", "priv-esc"],
    createdAtISO: "2026-01-20",
    members: [
      { name: "guest", role: "owner" },
      { name: "cyndelle", role: "member" },
      { name: "mark", role: "member" },
    ],
    labs: [
      {
        id: "mock-in-progress",
        name: "Mock Lab — In Progress",
        status: "active",
        progress: 42,
      },
      {
        id: "mock-completed",
        name: "Mock Lab — Completed",
        status: "completed",
        progress: 100,
      },
    ],
    starpaths: [
      {
        id: "sp-orion-foundations",
        name: "Orion Foundations",
        chaptersCompleted: 2,
        totalChapters: 6,
        domain: "Linux PrivEsc",
      },
    ],
  },
  {
    id: "grp-nova",
    name: "Nova Crew",
    visibility: "private",
    tagline: "Small crew — fast iterations, shared progress.",
    tags: ["web", "recon"],
    createdAtISO: "2026-01-28",
    members: [
      { name: "guest", role: "owner" },
      { name: "laura", role: "member" },
    ],
    labs: [
      {
        id: "mock-in-progress",
        name: "Mock Lab — In Progress",
        status: "active",
        progress: 18,
      },
    ],
    starpaths: [
      {
        id: "sp-web-attack-surface",
        name: "Web Attack Surface",
        chaptersCompleted: 1,
        totalChapters: 5,
        domain: "Web",
      },
    ],
  },
];

function GlassCard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        "rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl",
        "shadow-[0_18px_60px_rgba(0,0,0,0.45)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function ProgressBar({
  value,
}: {
  value: number; // 0..100
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-2 rounded-full"
        style={{
          width: `${v}%`,
          background: `linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
        }}
      />
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="flex items-center gap-2 text-xs text-white/55">
        <span className="opacity-80">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="mt-1 text-lg font-semibold text-white/90">{value}</div>
    </div>
  );
}

export default function GroupsView() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const mockMode = useMemo(() => {
    return new URLSearchParams(location.search).get("mock") === "1";
  }, [location.search]);

  // "real" group only via navigation state (until backend exists)
  const realStateGroup = (location.state as any)?.group as
    | RealPrivateGroupMinimal
    | undefined;

  const data: {
    mode: "mock" | "real";
    list: GroupViewModel[];
    selected?: GroupViewModel;
  } = useMemo(() => {
    if (mockMode) {
      const selected = id
        ? MOCK_GROUPS.find((g) => g.id === id)
        : undefined;
      return { mode: "mock", list: MOCK_GROUPS, selected };
    }

    // Real mode: only if passed from state
    if (!realStateGroup) return { mode: "real", list: [] };

    const vm: GroupViewModel = {
      id: realStateGroup.id,
      name: realStateGroup.name,
      visibility: "private",
      tagline: "Private collaboration space (runtime data not wired yet).",
      tags: ["private"],
      createdAtISO: undefined,
      members: [{ name: "you", role: "owner" }],
      labs: realStateGroup.labIds.map((labId) => ({
        id: labId,
        name: labId,
        status: "active",
        progress: 0,
      })),
      starpaths: realStateGroup.starpathIds.map((spId) => ({
        id: spId,
        name: spId,
        chaptersCompleted: 0,
        totalChapters: 1,
      })),
    };

    return { mode: "real", list: [vm], selected: vm };
  }, [mockMode, id, realStateGroup]);

  const selected = data.selected;

  // If no :id => show list
  const isListView = !id;

  return (
    <div className="min-h-screen w-full text-white">
      <div className="w-full px-6 sm:px-8 py-10 space-y-8">
        {/* Top row */}
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="text-xs tracking-[0.25em] text-white/45 uppercase">
              Groups
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              {isListView ? "Private Workspaces" : selected?.name ?? "Group"}
            </h1>
            <p className="text-sm text-white/60 max-w-2xl">
              {mockMode
                ? "Mock mode enabled — layout & interactions preview."
                : "Design-first view — backend wiring can follow."}
            </p>
          </div>

          <button
            onClick={() => navigate("/learner/dashboard")}
            className="rounded-full border border-white/12 bg-white/6 hover:bg-white/10 transition px-4 py-2 text-sm flex items-center gap-2"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        {/* LIST VIEW */}
        {isListView && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.mode === "real" && data.list.length === 0 ? (
              <GlassCard className="p-6">
                <div className="text-white/80 font-medium">
                  No group data yet
                </div>
                <div className="mt-2 text-sm text-white/55">
                  For now, open a group from the dashboard and pass it via
                  navigation state, or use <span className="text-white/80">?mock=1</span>.
                </div>
              </GlassCard>
            ) : (
              data.list.map((g) => {
                const labsCount = g.labs.length;
                const spCount = g.starpaths.length;
                const membersCount = g.members.length;

                return (
                  <GlassCard
                    key={g.id}
                    className="p-6 hover:border-white/15 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-lg font-semibold text-white/90">
                          {g.name}
                        </div>
                        <div className="mt-1 text-sm text-white/55">
                          {labsCount} labs • {spCount} starpaths • {membersCount} members
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs px-3 py-1 rounded-full border border-white/10 bg-black/20 text-white/70 flex items-center gap-2">
                          {g.visibility === "private" ? (
                            <Lock className="h-3.5 w-3.5" />
                          ) : (
                            <Globe className="h-3.5 w-3.5" />
                          )}
                          {g.visibility === "private" ? "Private" : "Public"}
                        </span>
                      </div>
                    </div>

                    {g.tagline && (
                      <div className="mt-4 text-sm text-white/60">
                        {g.tagline}
                      </div>
                    )}

                    {/* quick bars like your screenshot */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="text-[11px] tracking-widest text-white/45 uppercase">
                          Labs activity
                        </div>
                        <div className="mt-3">
                          <ProgressBar
                            value={
                              labsCount === 0
                                ? 0
                                : Math.min(
                                    100,
                                    Math.round(
                                      (g.labs.filter((l) => l.status === "active")
                                        .length /
                                        Math.max(1, labsCount)) *
                                        100
                                    )
                                  )
                            }
                          />
                        </div>
                        <div className="mt-2 text-xs text-white/55">
                          Assigned labs detected.
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="text-[11px] tracking-widest text-white/45 uppercase">
                          Starpaths activity
                        </div>
                        <div className="mt-3">
                          <ProgressBar value={spCount === 0 ? 0 : 100} />
                        </div>
                        <div className="mt-2 text-xs text-white/55">
                          Starpaths linked to this group.
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        navigate(`/learner/groups/${g.id}${mockMode ? "?mock=1" : ""}`, {
                          state: data.mode === "real" ? { group: realStateGroup } : undefined,
                        })
                      }
                      className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition px-5 py-3 flex items-center justify-between"
                      type="button"
                    >
                      <span className="text-sm text-white/80">
                        Open workspace
                      </span>
                      <ChevronRight className="h-4 w-4 text-white/55" />
                    </button>
                  </GlassCard>
                );
              })
            )}
          </div>
        )}

        {/* DETAIL VIEW */}
        {!isListView && (
          <>
            {!selected ? (
              <GlassCard className="p-6">
                <div className="text-white/80 font-medium">Group not found</div>
                <div className="mt-2 text-sm text-white/55">
                  {mockMode
                    ? "Unknown mock group id."
                    : "Open a group from the dashboard (state), or use ?mock=1."}
                </div>
                <button
                  onClick={() =>
                    navigate(`/learner/groups${mockMode ? "?mock=1" : ""}`)
                  }
                  className="mt-6 rounded-full border border-white/12 bg-white/6 hover:bg-white/10 transition px-4 py-2 text-sm"
                  type="button"
                >
                  Back to groups list
                </button>
              </GlassCard>
            ) : (
              <div className="space-y-8">
                {/* HERO */}
                <GlassCard className="p-7 sm:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs tracking-[0.25em] uppercase text-white/45"
                          style={{
                            color: "rgba(255,255,255,0.55)",
                          }}
                        >
                          Workspace
                        </span>

                        <span className="text-xs px-3 py-1 rounded-full border border-white/10 bg-black/20 text-white/70 flex items-center gap-2">
                          {selected.visibility === "private" ? (
                            <Lock className="h-3.5 w-3.5" />
                          ) : (
                            <Globe className="h-3.5 w-3.5" />
                          )}
                          {selected.visibility === "private" ? "Private" : "Public"}
                        </span>
                      </div>

                      <div
                        className="text-2xl sm:text-3xl font-semibold"
                        style={{
                          background: `linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {selected.name}
                      </div>

                      {selected.tagline && (
                        <div className="text-sm text-white/60 max-w-2xl">
                          {selected.tagline}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-2">
                        {selected.tags.map((t) => (
                          <span
                            key={t}
                            className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/70 flex items-center gap-2"
                          >
                            <Tag className="h-3.5 w-3.5 opacity-70" />
                            {t}
                          </span>
                        ))}
                        {selected.createdAtISO && (
                          <span className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/70 flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 opacity-70" />
                            {selected.createdAtISO}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <StatPill
                        icon={<Layers className="h-4 w-4" />}
                        label="Labs"
                        value={selected.labs.length}
                      />
                      <StatPill
                        icon={<Orbit className="h-4 w-4" />}
                        label="Starpaths"
                        value={selected.starpaths.length}
                      />
                      <StatPill
                        icon={<Users className="h-4 w-4" />}
                        label="Members"
                        value={selected.members.length}
                      />
                      <StatPill
                        icon={<Lock className="h-4 w-4" />}
                        label="Access"
                        value={selected.visibility}
                      />
                    </div>
                  </div>
                </GlassCard>

                {/* Activity blocks (like your screenshot) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <GlassCard className="p-6">
                    <div className="text-[11px] tracking-widest text-white/45 uppercase">
                      Labs activity
                    </div>

                    <div className="mt-4">
                      <ProgressBar
                        value={
                          selected.labs.length === 0
                            ? 0
                            : Math.min(
                                100,
                                Math.round(
                                  (selected.labs.filter((l) => l.status === "active")
                                    .length /
                                    Math.max(1, selected.labs.length)) *
                                    100
                                )
                              )
                        }
                      />
                    </div>

                    <div className="mt-3 text-sm text-white/65">
                      Assigned labs detected.
                    </div>

                    <div className="mt-5 space-y-3">
                      {selected.labs.length === 0 ? (
                        <div className="text-sm text-white/45">
                          No labs linked yet.
                        </div>
                      ) : (
                        selected.labs.map((l) => (
                          <button
                            key={l.id}
                            onClick={() => navigate(`/learner/labs/${l.id}`)}
                            className="w-full text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition px-4 py-3"
                            type="button"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-white/85">
                                {l.name}
                              </div>
                              <div className="text-xs text-white/55">
                                {l.status === "completed" ? "Completed" : "Active"}
                              </div>
                            </div>

                            {l.status === "active" && typeof l.progress === "number" && (
                              <div className="mt-3">
                                <ProgressBar value={l.progress} />
                              </div>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <div className="text-[11px] tracking-widest text-white/45 uppercase">
                      Starpaths activity
                    </div>

                    <div className="mt-4">
                      <ProgressBar value={selected.starpaths.length === 0 ? 0 : 100} />
                    </div>

                    <div className="mt-3 text-sm text-white/65">
                      Starpaths linked to this group.
                    </div>

                    <div className="mt-5 space-y-3">
                      {selected.starpaths.length === 0 ? (
                        <div className="text-sm text-white/45">
                          No starpaths linked yet.
                        </div>
                      ) : (
                        selected.starpaths.map((sp) => {
                          const pct =
                            sp.totalChapters > 0
                              ? Math.round((sp.chaptersCompleted / sp.totalChapters) * 100)
                              : 0;

                          return (
                            <button
                              key={sp.id}
                              onClick={() => navigate(`/learner/starpath/${sp.id}`)}
                              className="w-full text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition px-4 py-3"
                              type="button"
                            >
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-white/85">
                                  {sp.name}
                                </div>
                                <div className="text-xs text-white/55">{pct}%</div>
                              </div>
                              <div className="mt-2 text-xs text-white/50">
                                {sp.domain ? `${sp.domain} • ` : ""}
                                {sp.chaptersCompleted}/{sp.totalChapters} chapters
                              </div>
                              <div className="mt-3">
                                <ProgressBar value={pct} />
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </GlassCard>
                </div>

                {/* Roster */}
                <GlassCard className="p-6">
                  <div className="text-[11px] tracking-widest text-white/45 uppercase">
                    Roster
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selected.members.map((m) => (
                      <div
                        key={`${m.name}-${m.role}`}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                      >
                        <div className="text-sm font-medium text-white/85">
                          {m.name}
                        </div>
                        <div className="mt-1 text-xs text-white/55">
                          {m.role === "owner" ? "Owner" : "Member"}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 text-xs text-white/45">
                    (Members are mocked for now — will be wired to backend later.)
                  </div>
                </GlassCard>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
