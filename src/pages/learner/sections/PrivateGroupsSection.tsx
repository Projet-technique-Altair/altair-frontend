// src/pages/learner/sections/PrivateGroupsSection.tsx

import { Users, Shield } from "lucide-react";
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

    /*async function handleClick(group: GroupLike) {
    console.log("clicked group:", group.id);

    if (expandedId === group.id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(group.id);

    if (group.labs.length > 0 || group.starpaths.length > 0) {
      return;
    }

    try {
      const labsRes = await fetch(`/groups/${group.id}/labs`).then((r) => r.json());
      const starpathsRes = await fetch(`/groups/${group.id}/starpaths`).then((r) => r.json());

      console.log("labsRes:", labsRes);
      console.log("starpathsRes:", starpathsRes);

      setGroups((prev) =>
        prev.map((g) =>
          g.id === group.id
            ? {
                ...g,
                labs: (labsRes.data ?? []).map((l: any) => ({
                  id: l.lab_id,
                  name: l.lab_id,
                })),
                starpaths: (starpathsRes.data ?? []).map((s: any) => ({
                  id: s,
                  name: s,
                })),
              }
            : g
        )
      );
    } catch (error) {
      console.error("group details fetch failed:", error);
    }
  }*/

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

      /*setGroups((prev) =>
        prev.map((g) =>
          g.id === group.id
            ? {
                ...g,
                labs: (labsRes ?? []).map((l: any) => ({
                  id: l.lab_id,
                  name: labNameMap[l.lab_id] ?? l.lab_id,
                })),
                starpaths: (starpathsRes ?? []).map((s: any) => ({
                  id: typeof s === "string" ? s : s.starpath_id,
                  name:
                    starpathNameMap[typeof s === "string" ? s : s.starpath_id] ??
                    (typeof s === "string" ? s : s.starpath_id),
                })),
              }
            : g
        )
      );*/
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
      title="Private Groups"
      subtitle="Your secured workspaces for collaborative runs."
      count={groups.length}
    >
      {groups.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-white/65">
          <div className="text-sm font-semibold">No groups yet</div>
          <div className="mt-2 text-xs text-white/55">
            Private groups will appear here once you join or create one.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <div
              key={g.id}
              onClick={() => handleClick(g)}
              className="cursor-pointer rounded-2xl border border-white/10 bg-black/20 px-5 py-4 hover:bg-white/5 hover:border-white/15 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-white/60" />
                    <div className="truncate text-sm font-semibold text-white/90">
                      {g.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <Shield className="h-3.5 w-3.5 text-white/55" />
                  <span className="text-[11px] text-white/60">Private</span>
                </div>
              </div>

              {/* LABS */}
              {/* EXPANDED CONTENT */}
              {expandedId === g.id && (
                <div className="mt-4 space-y-4">
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
                            className="w-full text-left px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition text-sm text-white/80"
                          >
                            {lab.name}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/55">
                        No labs in this group.
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
                            className="w-full text-left px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition text-sm text-white/80"
                          >
                            {sp.name}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/55">
                        No starpaths in this group.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </GlassPanel>
  );
}

