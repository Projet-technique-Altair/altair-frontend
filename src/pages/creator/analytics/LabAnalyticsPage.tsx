import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  Eye,
  Globe,
  Star,
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

type MetricCardProps = {
  icon: typeof Eye;
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

export default function LabAnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const lab = {
    id,
    title: "Linux Forensics Fundamentals",
    createdAt: "2025-09-20",
    visibility: "public",
    rating: 4.6,
    views: 320,
    completions: 210,
  };

  const viewsData = [
    { date: "Oct 01", views: 20 },
    { date: "Oct 05", views: 45 },
    { date: "Oct 10", views: 80 },
    { date: "Oct 15", views: 130 },
    { date: "Oct 20", views: 210 },
    { date: "Oct 25", views: 320 },
  ];

  const completionRate = useMemo(() => {
    if (lab.views === 0) return "0.0";
    return ((lab.completions / lab.views) * 100).toFixed(1);
  }, [lab.completions, lab.views]);

  const visibilityLabel = lab.visibility === "public" ? "Public" : "Private";

  const growthLabel = useMemo(() => {
    if (viewsData.length < 2) return "No trend yet";
    const first = viewsData[0]?.views ?? 0;
    const last = viewsData[viewsData.length - 1]?.views ?? 0;

    if (first <= 0) return "Growing";
    const delta = (((last - first) / first) * 100).toFixed(0);
    return `${delta}% vs first point`;
  }, [viewsData]);

  return (
    <div className="min-h-screen w-full text-white">
      <div className="mx-auto w-full max-w-[1680px] px-6 py-10 xl:px-10 2xl:px-14">
        <div>
          <button
            onClick={() => navigate(`/creator/lab/${id}`)}
            className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white/80"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="mt-5 text-[11px] uppercase tracking-[0.22em] text-white/45">
            Creator lab
          </div>

          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white/92 sm:text-4xl">
                Analytics
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
                Review the current performance of this lab through engagement,
                rating, completion, and trend data.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md">
              <div className="text-[11px] uppercase tracking-wide text-white/45">
                Lab
              </div>
              <div className="mt-2 text-base font-semibold text-white/90">
                {lab.title}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/creator/lab/${id}`)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/82 transition hover:border-white/15 hover:bg-white/5"
              type="button"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => navigate(`/creator/lab/${id}/edit`)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/82 transition hover:border-sky-400/30 hover:bg-white/5"
              type="button"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Edit lab</span>
            </button>
          </div>

          <div className="mt-6 h-px w-full bg-white/10" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Eye}
            label="Total views"
            value={`${lab.views}`}
            hint="Learner visits across the selected period."
          />

          <MetricCard
            icon={Star}
            label="Average rating"
            value={`${lab.rating.toFixed(1)}/5`}
            hint="Current learner feedback average."
          />

          <MetricCard
            icon={CheckCircle2}
            label="Completion rate"
            value={`${completionRate}%`}
            hint={`${lab.completions} completions from ${lab.views} views.`}
          />

          <MetricCard
            icon={TrendingUp}
            label="Growth"
            value={growthLabel}
            hint="Based on the visible view history."
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-white/50">
                    Views over time
                  </div>
                  <div className="mt-2 text-sm text-white/60">
                    Track how visibility and engagement evolve across the lab
                    lifecycle.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/55">
                  {viewsData.length} data points
                </div>
              </div>

              <div className="mt-6 h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={viewsData}
                    margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="date"
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
                      dataKey="views"
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
                Lab context
              </div>

              <div className="mt-5 space-y-4">
                <InfoRow label="Title" value={lab.title} />

                <InfoRow label="Created at" value={lab.createdAt} />

                <InfoRow
                  label="Visibility"
                  value={
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-emerald-300" />
                      <span>{visibilityLabel}</span>
                    </div>
                  }
                />

                <InfoRow
                  label="Performance summary"
                  value="This lab shows solid engagement and a healthy completion level relative to total views."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}