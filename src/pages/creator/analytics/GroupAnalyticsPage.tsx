import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  FlaskConical,
  Orbit,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { api } from "@/api";
import { getStarpath } from "@/api/starpaths";
import { getLab } from "@/api/labs";
import { getUserPseudo } from "@/api/users";

type MetricCardProps = {
  icon: typeof Users;
  label: string;
  value: string;
  hint?: string;
};

function MetricCard({ icon: Icon, label, value, hint }: MetricCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-white/45">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-white/92">
        {value}
      </div>
      {hint && <div className="mt-2 text-sm text-white/52">{hint}</div>}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-white/50">
        {label}
      </div>
      <div className="mt-2 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/84">
        {value}
      </div>
    </div>
  );
}

export default function GroupAnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [starpaths, setStarpaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) {
        navigate("/creator/workspace", { replace: true });
        return;
      }

      setLoading(true);
      setLoadError(null);

      try {
        const [g, m, l, sp] = await Promise.all([
          api.getGroupById(id),
          api.getGroupMembers(id),
          api.getGroupLabs(id),
          api.getGroupStarpaths(id),
        ]);

        const enrichedMembers = await Promise.all(
          (m ?? []).map(async (member: any) => {
            try {
              const fullUser = await getUserPseudo(member.user_id);
              return {
                ...member,
                pseudo: fullUser?.pseudo || "Unknown user",
              };
            } catch {
              return {
                ...member,
                pseudo: "Unknown user",
              };
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
              };
            } catch {
              return {
                ...lab,
                name: "Unknown lab",
              };
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
              };
            } catch {
              return {
                starpath_id: starpathId,
                name: "Unknown starpath",
              };
            }
          }),
        );

        if (cancelled) return;

        setGroup(g);
        setMembers(enrichedMembers);
        setLabs(enrichedLabs);
        setStarpaths(enrichedStarpaths);
      } catch (error) {
        console.error("Failed to load group analytics:", error);

        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Failed to load group analytics.",
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
  }, [id, navigate]);

  const chartData = useMemo(() => {
    const membersCount = members.length;
    const labsCount = labs.length;
    const starpathsCount = starpaths.length;

    return [
      { label: "Structure", value: Math.max(1, labsCount + starpathsCount) },
      { label: "Members", value: Math.max(1, membersCount) },
      { label: "Coverage", value: Math.max(1, membersCount * Math.max(1, labsCount)) },
      { label: "Path load", value: Math.max(1, membersCount * Math.max(1, starpathsCount)) },
    ];
  }, [labs.length, members.length, starpaths.length]);

  const assignmentDensity = useMemo(() => {
    const membersCount = members.length;
    const contentCount = labs.length + starpaths.length;

    if (membersCount === 0) return "0.0";
    return (contentCount / membersCount).toFixed(1);
  }, [labs.length, members.length, starpaths.length]);

  const growthLabel = useMemo(() => {
    if (chartData.length < 2) return "No trend yet";
    const first = chartData[0]?.value ?? 0;
    const last = chartData[chartData.length - 1]?.value ?? 0;

    if (first <= 0) return "Growing";
    const delta = (((last - first) / first) * 100).toFixed(0);
    return `${delta}% vs first point`;
  }, [chartData]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-6 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <div className="animate-pulse text-white/70">Loading analytics…</div>
        </div>
      </div>
    );
  }

  if (loadError || !group) {
    return (
      <div className="min-h-screen w-full text-white">
        <div className="mx-auto w-full max-w-[1680px] px-6 py-10 xl:px-10 2xl:px-14">
          <button
            onClick={() => navigate(`/creator/group/${id}`)}
            className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white/80"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="mt-8 rounded-3xl border border-red-400/20 bg-red-500/10 p-6">
            <div className="text-base font-semibold text-red-100">
              Failed to load analytics
            </div>
            <div className="mt-2 text-sm leading-relaxed text-red-200/90">
              {loadError || "This analytics page could not be loaded."}
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
            onClick={() => navigate(`/creator/group/${id}`)}
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
                Analytics
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
                Review the current structure and content distribution of this group.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md">
              <div className="text-[11px] uppercase tracking-wide text-white/45">
                Group
              </div>
              <div className="mt-2 text-base font-semibold text-white/90">
                {group.name}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/creator/group/${id}`)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/82 transition hover:border-white/15 hover:bg-white/5"
              type="button"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => navigate(`/creator/group/${id}/edit`)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/82 transition hover:border-sky-400/30 hover:bg-white/5"
              type="button"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Edit group</span>
            </button>
          </div>

          <div className="mt-6 h-px w-full bg-white/10" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Users}
            label="Members"
            value={`${members.length}`}
            hint="Learners currently assigned to this group."
          />
          <MetricCard
            icon={FlaskConical}
            label="Labs"
            value={`${labs.length}`}
            hint="Labs assigned to the group."
          />
          <MetricCard
            icon={Orbit}
            label="Starpaths"
            value={`${starpaths.length}`}
            hint="Starpaths assigned to the group."
          />
          <MetricCard
            icon={TrendingUp}
            label="Assignment density"
            value={assignmentDensity}
            hint="Average linked content per member."
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-white/50">
                    Structure trend
                  </div>
                  <div className="mt-2 text-sm text-white/60">
                    A synthetic view of how the group scales across members and linked content.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/55">
                  {chartData.length} data points
                </div>
              </div>

              <div className="mt-6 h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="label"
                      stroke="rgba(255,255,255,0.45)"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.45)"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                    />
                    <Tooltip
                      cursor={{ stroke: "rgba(255,255,255,0.12)" }}
                      contentStyle={{
                        background: "rgba(11,15,25,0.96)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "16px",
                        color: "white",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#a855f7"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="space-y-6 xl:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md xl:sticky xl:top-6">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Group context
              </div>

              <div className="mt-5 space-y-4">
                <InfoRow label="Name" value={group.name} />
                <InfoRow
                  label="Description"
                  value={group.description?.trim() || "No description provided."}
                />
                <InfoRow label="Growth" value={growthLabel} />
                <InfoRow
                  label="Performance summary"
                  value="This group can be evaluated through its member base and the amount of linked learning content."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}