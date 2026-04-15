// src/pages/learner/sections/PrivateGroupsSection.tsx

import { Users, Shield, ChevronRight, Orbit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { getGroupLabs, getGroupStarpaths } from "@/api/groups";
import { getLab } from "@/api/labs";
import { getStarpath } from "@/api/starpaths";

type GroupItem = {
  id: string;
  name: string;
};

type GroupLike = {
  id: string;
  name: string;
  labs: GroupItem[];
  starpaths: GroupItem[];
};

type LabOption = {
  id: string;
  name: string;
};

type StarpathOption = {
  id: string;
  name: string;
};

interface PrivateGroupsSectionProps {
  groups: GroupLike[];
  setGroups: React.Dispatch<React.SetStateAction<GroupLike[]>>;
  labs: LabOption[];
  starpaths: StarpathOption[];
}

function GlassPanel({
  eyebrow,
  title,
  subtitle,
  count,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_24px_90px_rgba(0,0,0,0.45)] overflow-hidden">
      <div className="relative p-8">
        
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -top-28 -left-28 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/5 blur-3xl" />
        </div>

        <div className="relative flex items-start justify-between gap-8">
          <div>
            <div className="text-[11px] tracking-wide uppercase text-white/55">
              {eyebrow}
            </div>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white/90">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-1.5 text-sm text-white/60 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>

          {typeof count === "number" && (
            <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
              <div className="text-[10px] text-white/55 tracking-wide">Count</div>
              <div className="mt-1 text-xl font-semibold text-white/90">{count}</div>
            </div>
          )}
        </div>

        <div className="relative mt-7">{children}</div>
      </div>
    </div>
  );
}

export default function PrivateGroupsSection({
  groups,
  setGroups,
  labs,
  starpaths,
}: PrivateGroupsSectionProps) { 
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const labNameMap = useMemo(() => {
    return Object.fromEntries(labs.map((lab) => [lab.id, lab.name]));
  }, [labs]);

  const starpathNameMap = useMemo(() => {
    return Object.fromEntries(starpaths.map((starpath) => [starpath.id, starpath.name]));
  }, [starpaths]);

  async function handleClick(group: GroupLike) {
    console.log("CLICKED", group.id);

    if (expandedId === group.id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(group.id);

    try {
      console.log("FETCHING LABS...");

      const labsRes = await getGroupLabs(group.id);

      console.log("FETCHING STARPATHS...");

      const starpathsRes = await getGroupStarpaths(group.id);

      console.log("labsRes:", labsRes);
      console.log("starpathsRes:", starpathsRes);

      // ===== LABS =====
      const labDetails = await Promise.all(
        (labsRes ?? []).map(async (l: any) => {
          try {
            const fullLab = await getLab(l.lab_id);

            return {
              id: l.lab_id,
              name: fullLab.name,
            };
          } catch {
            return {
              id: l.lab_id,
              name: l.lab_id,
            };
          }
        })
      );

      // ===== STARPATHS =====
      const starpathDetails = await Promise.all(
        (starpathsRes ?? []).map(async (s: any) => {
          const id = typeof s === "string" ? s : s.starpath_id;

          try {
            const fullStarpath = await getStarpath(id);

            return {
              id,
              name: fullStarpath.name,
            };
          } catch {
            return {
              id,
              name: id,
            };
          }
        })
      );

      // ===== UPDATE STATE =====
      setGroups((prev) =>
        prev.map((g) =>
          g.id === group.id
            ? {
                ...g,
                labs: labDetails,
                starpaths: starpathDetails,
              }
            : g
        )
      );
    } catch (e) {
      console.error("FETCH ERROR", e);
    }
  }

  return (
    <GlassPanel
      eyebrow="Groups"
      title="Secure Collaborative Nodes"
      subtitle="Access your private operational groups."
      count={groups.length}
    >
      {groups.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-white/65">
          <div className="text-sm font-semibold">No groups detected</div>
          <div className="mt-2 text-xs text-white/55">
            You are not currently assigned to any group.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => {
            const isOpen = expandedId === g.id;

            return (
              <div key={g.id} className="space-y-2">
                
                {/* MAIN ITEM */}
                <button
                  onClick={() => handleClick(g)}
                  className={[
                    "w-full text-left rounded-2xl border border-white/10 bg-black/20",
                    "px-5 py-4 transition",
                    "hover:bg-white/5 hover:border-white/15 hover:shadow-[0_18px_50px_rgba(0,0,0,0.35)]",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-4">
                    
                    {/* LEFT */}
                    <div className="flex items-center gap-2 min-w-0">
                      <Users className="h-4 w-4 text-white/60" />
                      <div className="truncate text-sm font-semibold text-white/90">
                        {g.name}
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                        <Shield className="h-3 w-3 text-white/55" />
                        <span className="text-[10px] text-white/60">Private</span>
                      </div>

                      <ChevronRight
                        className={`h-4 w-4 text-white/40 transition-transform ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>
                </button>

                {/* EXPANDED */}
                {isOpen && (
                  <div className="ml-2 space-y-3 border-l border-white/10 pl-4">
                    
                    {/* LABS */}
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-white/55 mb-2">
                        Labs
                      </div>

                      {g.labs.length > 0 ? (
                        <div className="space-y-2">
                          {g.labs.map((lab) => (
                            <button
                              key={lab.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/learner/labs/${lab.id}`);
                              }}
                              className={[
                                "w-full text-left rounded-xl border border-white/10 bg-black/20",
                                "px-4 py-2 transition",
                                "hover:bg-white/5 hover:border-white/15",
                              ].join(" ")}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Users className="h-3.5 w-3.5 text-white/50" />
                                  <span className="text-sm text-white/85">
                                    {lab.name}
                                  </span>
                                </div>
                                <ChevronRight className="h-3.5 w-3.5 text-white/30" />
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/55">
                          No labs assigned.
                        </div>
                      )}
                    </div>

                    {/* STARPATHS */}
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-white/55 mb-2">
                        Starpaths
                      </div>

                      {g.starpaths.length > 0 ? (
                        <div className="space-y-2">
                          {g.starpaths.map((sp) => (
                            <button
                              key={sp.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/learner/starpaths/${sp.id}`);
                              }}
                              className={[
                                "w-full text-left rounded-xl border border-white/10 bg-black/20",
                                "px-4 py-2 transition",
                                "hover:bg-white/5 hover:border-white/15",
                              ].join(" ")}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Orbit className="h-3.5 w-3.5 text-white/50" />
                                  <span className="text-sm text-white/85">
                                    {sp.name}
                                  </span>
                                </div>
                                <ChevronRight className="h-3.5 w-3.5 text-white/30" />
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/55">
                          No starpaths assigned.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </GlassPanel>
  );
}

