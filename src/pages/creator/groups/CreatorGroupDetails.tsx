import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  FlaskConical,
  Orbit,
  Pencil,
  Users,
} from "lucide-react";

import { api } from "@/api";
import { getLab } from "@/api/labs";
import { getStarpath } from "@/api/starpaths";
import { getUserPseudo } from "@/api/users";

type EnrichedMember = {
  user_id: string;
  pseudo: string;
};

type EnrichedLab = {
  lab_id: string;
  name: string;
};

type EnrichedStarpath = {
  starpath_id: string;
  name: string;
};

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-wide text-white/50">
      {children}
    </div>
  );
}

function DisplayBlock({ children }: { children: ReactNode }) {
  const isEmpty =
    children == null ||
    children === "" ||
    (typeof children === "string" && children.trim() === "");

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/85">
      {isEmpty ? <span className="text-white/40">—</span> : children}
    </div>
  );
}

function SummaryPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
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

function EmptyStateCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6">
      <div className="text-sm font-semibold text-white/84">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-white/50">{text}</div>
    </div>
  );
}

export default function CreatorGroupDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const groupId = useMemo(() => (typeof id === "string" ? id.trim() : ""), [id]);

  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<EnrichedMember[]>([]);
  const [labs, setLabs] = useState<EnrichedLab[]>([]);
  const [starpaths, setStarpaths] = useState<EnrichedStarpath[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!groupId) {
        navigate("/creator/workspace", { replace: true });
        return;
      }

      setLoading(true);
      setLoadError(null);

      try {
        const [g, m, l, sp] = await Promise.all([
          api.getGroupById(groupId),
          api.getGroupMembers(groupId),
          api.getGroupLabs(groupId),
          api.getGroupStarpaths(groupId),
        ]);

        const enrichedMembers = await Promise.all(
          (m ?? []).map(async (member: any) => {
            try {
              const fullUser = await getUserPseudo(member.user_id);
              return {
                ...member,
                pseudo: fullUser?.pseudo || "Unknown user",
              } as EnrichedMember;
            } catch {
              return {
                ...member,
                pseudo: "Unknown user",
              } as EnrichedMember;
            }
          }),
        );

        const enrichedLabs = await Promise.all(
          (l ?? []).map(async (lab: any) => {
            try {
              const fullLab = await getLab(lab.lab_id);
              return {
                ...lab,
                name: fullLab?.name || "Unknown lab",
              } as EnrichedLab;
            } catch {
              return {
                ...lab,
                name: "Unknown lab",
              } as EnrichedLab;
            }
          }),
        );

        const enrichedStarpaths = await Promise.all(
          (sp ?? []).map(async (starpath: any) => {
            const starpathId =
              typeof starpath === "string" ? starpath : starpath.starpath_id;

            try {
              const fullStarpath = await getStarpath(starpathId);
              return {
                starpath_id: starpathId,
                name: fullStarpath?.name || "Unknown starpath",
              } as EnrichedStarpath;
            } catch {
              return {
                starpath_id: starpathId,
                name: "Unknown starpath",
              } as EnrichedStarpath;
            }
          }),
        );

        if (cancelled) return;

        setGroup(g);
        setMembers(enrichedMembers);
        setLabs(enrichedLabs);
        setStarpaths(enrichedStarpaths);
      } catch (error) {
        console.error("Failed to load group details:", error);

        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Failed to load group details.",
          );
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
  }, [groupId, navigate]);

  const visibleMembers = members.slice(0, 4);
  const visibleLabs = labs.slice(0, 3);
  const visibleStarpaths = starpaths.slice(0, 3);

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
                <div className="h-96 rounded-3xl border border-white/10 bg-white/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !group) {
    return (
      <div className="min-h-screen w-full text-white">
        <div className="mx-auto w-full max-w-[1680px] px-6 py-10 xl:px-10 2xl:px-14">
          <button
            onClick={() => navigate("/creator/workspace")}
            className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white/80"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="mt-8 rounded-3xl border border-red-400/20 bg-red-500/10 p-6">
            <div className="text-base font-semibold text-red-100">
              Failed to load group details
            </div>
            <div className="mt-2 text-sm leading-relaxed text-red-200/90">
              {loadError || "This group could not be loaded."}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => window.location.reload()}
                className="rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-500/15"
                type="button"
              >
                Retry
              </button>
              <button
                onClick={() => navigate("/creator/workspace")}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/82 transition hover:bg-white/5"
                type="button"
              >
                Return to workspace
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full text-white">
      <div className="mx-auto w-full max-w-[1680px] px-6 py-10 xl:px-10 2xl:px-14">
        <div>
          <button
            onClick={() => navigate("/creator/workspace")}
            className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white/80"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="mt-5 text-[11px] uppercase tracking-[0.22em] text-white/45">
            Creator group
          </div>

          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white/92 sm:text-4xl">
                {group.name || "Group"}
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
                {group.description?.trim() || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <SummaryPill icon={Users} label="Members" value={`${members.length}`} />
              <SummaryPill icon={FlaskConical} label="Labs" value={`${labs.length}`} />
              <SummaryPill icon={Orbit} label="Starpaths" value={`${starpaths.length}`} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/creator/group/${groupId}/edit`)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/86 transition hover:border-sky-400/40 hover:bg-white/5 hover:shadow-[0_0_40px_rgba(56,189,248,0.18)]"
              type="button"
            >
              <Pencil className="h-4 w-4" />
              <span>Edit group</span>
            </button>

            <button
              onClick={() => navigate(`/creator/group/${groupId}/analytics`)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/82 transition hover:border-emerald-400/40 hover:bg-white/5"
              type="button"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </button>
          </div>

          <div className="mt-6 h-px w-full bg-white/10" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Group content
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <FieldLabel>Name</FieldLabel>
                  <DisplayBlock>{group.name}</DisplayBlock>
                </div>

                <div>
                  <FieldLabel>Description</FieldLabel>
                  <DisplayBlock>{group.description}</DisplayBlock>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-white/50">
                    Members overview
                  </div>
                  <div className="mt-2 text-sm text-white/60">
                    Preview of the learners currently assigned to this group.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/55">
                  {members.length} total
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {members.length === 0 ? (
                  <EmptyStateCard
                    title="No members assigned yet"
                    text="Members can be added from the edit page once the group is set up."
                  />
                ) : (
                  visibleMembers.map((member) => (
                    <div
                      key={member.user_id}
                      className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/84"
                    >
                      {member.pseudo}
                    </div>
                  ))
                )}

                {members.length > visibleMembers.length && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/52">
                    {members.length - visibleMembers.length} more member
                    {members.length - visibleMembers.length > 1 ? "s" : ""} not shown in this preview.
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-white/50">
                      Labs overview
                    </div>
                    <div className="mt-2 text-sm text-white/60">
                      Current lab assignments.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/55">
                    {labs.length} linked
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {labs.length === 0 ? (
                    <EmptyStateCard
                      title="No labs assigned yet"
                      text="Labs can be linked to this group from the edit page."
                    />
                  ) : (
                    visibleLabs.map((lab) => (
                      <div
                        key={lab.lab_id}
                        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/84"
                      >
                        {lab.name}
                      </div>
                    ))
                  )}

                  {labs.length > visibleLabs.length && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/52">
                      {labs.length - visibleLabs.length} more lab
                      {labs.length - visibleLabs.length > 1 ? "s" : ""} not shown.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-white/50">
                      Starpaths overview
                    </div>
                    <div className="mt-2 text-sm text-white/60">
                      Current starpath assignments.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/55">
                    {starpaths.length} linked
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {starpaths.length === 0 ? (
                    <EmptyStateCard
                      title="No starpaths assigned yet"
                      text="Starpaths can be linked to this group from the edit page."
                    />
                  ) : (
                    visibleStarpaths.map((starpath) => (
                      <div
                        key={starpath.starpath_id}
                        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/84"
                      >
                        {starpath.name}
                      </div>
                    ))
                  )}

                  {starpaths.length > visibleStarpaths.length && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/52">
                      {starpaths.length - visibleStarpaths.length} more starpath
                      {starpaths.length - visibleStarpaths.length > 1 ? "s" : ""} not shown.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 xl:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md xl:sticky xl:top-6">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Summary
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <FieldLabel>Status</FieldLabel>
                  <DisplayBlock>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                      <span>Active group</span>
                    </div>
                  </DisplayBlock>
                </div>

                <div>
                  <FieldLabel>Members</FieldLabel>
                  <DisplayBlock>{members.length}</DisplayBlock>
                </div>

                <div>
                  <FieldLabel>Labs</FieldLabel>
                  <DisplayBlock>{labs.length}</DisplayBlock>
                </div>

                <div>
                  <FieldLabel>Starpaths</FieldLabel>
                  <DisplayBlock>{starpaths.length}</DisplayBlock>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-white/44">
                  Use the edit page to manage members and assignments, or open analytics to review engagement and structure.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}