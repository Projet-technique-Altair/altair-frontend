import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Globe,
  Lock,
  Orbit,
  Sparkles,
  TrendingUp,
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

import { getLab } from "@/api/labs";
import { getStarpath, getStarpathLabs } from "@/api/starpaths";

type MetricCardProps = {
  icon: typeof Orbit;
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

export default function StarpathAnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [starpath, setStarpath] = useState<any>(null);
  const [labs, setLabs] = useState<any[]>([]);
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
              };
            } catch {
              return {
                ...lab,
                name: "Unknown lab",
              };
            }
          }),
        );

        if (cancelled) return;

        const sortedLabs = [...enrichedLabs].sort(
          (left, right) => (left.position ?? 0) - (right.position ?? 0),
        );

        setStarpath(starpathData);
        setLabs(sortedLabs);
      } catch (error) {
        console.error("Failed to load starpath analytics:", error);

        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Failed to load starpath analytics.",
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

  const chartData = useMemo(
    () =>
      labs.map((lab, index) => ({
        label: `Lab ${index + 1}`,
        value: index + 1,
      })),
    [labs],
  );

  const difficultyLabel =
    starpath?.difficulty === "beginner"
      ? "Beginner"
      : starpath?.difficulty === "intermediate"
        ? "Intermediate"
        : starpath?.difficulty === "advanced"
          ? "Advanced"
          : "Not set";

  const visibilityLabel =
    starpath?.visibility === "PUBLIC" ? "Public" : "Private";

  const progressionDepth = `${labs.length} stage${labs.length > 1 ? "s" : ""}`;

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

  if (loadError || !starpath) {
    return (
      <div className="min-h-screen w-full text-white">
        <div className="mx-auto w-full max-w-[1680px] px-6 py-10 xl:px-10 2xl:px-14">
          <button
            onClick={() => navigate(`/creator/starpath/${id}`)}
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
                Analytics
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
                Review the current structure and progression density of this starpath.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md">
              <div className="text-[11px] uppercase tracking-wide text-white/45">
                Starpath
              </div>
              <div className="mt-2 text-base font-semibold text-white/90">
                {starpath.name}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/creator/starpath/${id}`)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/82 transition hover:border-white/15 hover:bg-white/5"
              type="button"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => navigate(`/creator/starpath/${id}/edit`)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/82 transition hover:border-sky-400/30 hover:bg-white/5"
              type="button"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Edit starpath</span>
            </button>
          </div>

          <div className="mt-6 h-px w-full bg-white/10" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Orbit}
            label="Labs linked"
            value={`${labs.length}`}
            hint="Labs currently attached to the path."
          />
          <MetricCard
            icon={Sparkles}
            label="Difficulty"
            value={difficultyLabel}
            hint="Current progression level for this path."
          />
          <MetricCard
            icon={TrendingUp}
            label="Progression depth"
            value={progressionDepth}
            hint="Number of linked stages in the path."
          />
          <MetricCard
            icon={Globe}
            label="Visibility"
            value={visibilityLabel}
            hint="Current publication state."
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-white/50">
                    Path progression
                  </div>
                  <div className="mt-2 text-sm text-white/60">
                    Visualize the current ordered depth of this starpath.
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
                Starpath context
              </div>

              <div className="mt-5 space-y-4">
                <InfoRow label="Name" value={starpath.name} />
                <InfoRow
                  label="Description"
                  value={starpath.description?.trim() || "No description provided."}
                />
                <InfoRow
                  label="Visibility"
                  value={
                    <div className="flex items-center gap-2">
                      {starpath.visibility === "PUBLIC" ? (
                        <Globe className="h-4 w-4 text-emerald-300" />
                      ) : (
                        <Lock className="h-4 w-4 text-white/55" />
                      )}
                      <span>{visibilityLabel}</span>
                    </div>
                  }
                />
                <InfoRow label="Growth" value={growthLabel} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}