// src/pages/learner/sections/PrivateGroupsSection.tsx

import { Users, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

interface PrivateGroupsSectionProps {
  groups: GroupLike[];
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
}: PrivateGroupsSectionProps) {
  const navigate = useNavigate();

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
              className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4 hover:bg-white/5 hover:border-white/15 transition"
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
              {g.labs.length > 0 && (
                <div className="mt-4">
                  <div className="text-[11px] uppercase tracking-wide text-white/55 mb-2">
                    Labs
                  </div>

                  <div className="space-y-2">
                    {g.labs.map((lab) => (
                      <button
                        key={lab.id}
                        onClick={() => navigate(`/learner/labs/${lab.id}`)}
                        className="w-full text-left px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition text-sm text-white/80"
                      >
                        {lab.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STARPATHS */}
              {g.starpaths.length > 0 && (
                <div className="mt-4">
                  <div className="text-[11px] uppercase tracking-wide text-white/55 mb-2">
                    Starpaths
                  </div>

                  <div className="space-y-2">
                    {g.starpaths.map((sp) => (
                      <button
                        key={sp.id}
                        onClick={() => navigate(`/learner/starpaths/${sp.id}`)}
                        className="w-full text-left px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition text-sm text-white/80"
                      >
                        {sp.name}
                      </button>
                    ))}
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