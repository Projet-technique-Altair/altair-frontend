// src/pages/creator/CreatorDashboard.tsx

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Flame,
  MessageSquare,
  Orbit,
  Rocket,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";

/* =========================
   MOCK DATA
========================= */
type KpiItem = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "neutral";
};

type PerformanceCard = {
  title: string;
  value: string;
  subtitle: string;
  accent: "violet" | "blue" | "orange" | "rose";
  icon: React.ReactNode;
};

type AlertCard = {
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
};

type ActivityItem = {
  title: string;
  subtitle: string;
  time: string;
  kind: "launch" | "completion" | "comment" | "group" | "feedback";
};

const kpis: KpiItem[] = [
  { label: "Total labs", value: "12", delta: "+2 this week", trend: "up" },
  { label: "Total starpaths", value: "5", delta: "+1 this week", trend: "up" },
  { label: "Total groups", value: "8", delta: "+1 this month", trend: "up" },
  { label: "Active learners", value: "124", delta: "+14 vs last 7d", trend: "up" },
  { label: "Active groups", value: "6", delta: "2 inactive", trend: "neutral" },
  { label: "Launches · 7d", value: "342", delta: "+18%", trend: "up" },
  { label: "Completions · 7d", value: "189", delta: "+9%", trend: "up" },
  { label: "Completion rate", value: "55%", delta: "-3%", trend: "down" },
  { label: "Pending comments", value: "7", delta: "3 need review", trend: "neutral" },
  { label: "Alerts", value: "4", delta: "1 critical", trend: "down" },
];

const trendingContent = [
  { rank: "01", name: "Web Exploitation Basics", meta: "124 launches · 68 completions" },
  { rank: "02", name: "SQL Injection Lab", meta: "96 launches · 34 comments" },
  { rank: "03", name: "OSINT Path", meta: "72 starts · 61% completion" },
];

const performanceCards: PerformanceCard[] = [
  {
    title: "Top lab",
    value: "Web Exploitation Basics",
    subtitle: "124 launches in the last 7 days",
    accent: "blue",
    icon: <Rocket className="h-4 w-4" />,
  },
  {
    title: "Worst lab",
    value: "Network Fundamentals",
    subtitle: "0 launches · highest abandonment",
    accent: "rose",
    icon: <TrendingDown className="h-4 w-4" />,
  },
  {
    title: "Top starpath",
    value: "OSINT Path",
    subtitle: "Strongest engagement this week",
    accent: "violet",
    icon: <Orbit className="h-4 w-4" />,
  },
  {
    title: "Most active group",
    value: "Group Alpha",
    subtitle: "Best activity and completion rhythm",
    accent: "orange",
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: "Most commented",
    value: "SQL Injection Lab",
    subtitle: "34 comments · highest discussion volume",
    accent: "violet",
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    title: "Most disliked",
    value: "Linux PrivEsc Lab",
    subtitle: "Feedback quality requires attention",
    accent: "rose",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
];

const alerts: AlertCard[] = [
  {
    title: "Inactive groups detected",
    description: "2 groups have been inactive for more than 5 days.",
    severity: "high",
  },
  {
    title: "Lab with zero launches",
    description: "Network Fundamentals has not been launched this week.",
    severity: "medium",
  },
  {
    title: "Starpath drop-off spike",
    description: "OSINT Path loses most learners after the second step.",
    severity: "high",
  },
  {
    title: "Unanswered feedback",
    description: "3 recent comments still need a creator response.",
    severity: "low",
  },
];

const activities: ActivityItem[] = [
  {
    title: "Emma started Web Exploitation Basics",
    subtitle: "Launch recorded from Group Alpha",
    time: "5m ago",
    kind: "launch",
  },
  {
    title: "Theo completed SQL Injection Lab",
    subtitle: "Completion added to private cohort analytics",
    time: "18m ago",
    kind: "completion",
  },
  {
    title: "New comment on OSINT Path",
    subtitle: "Learner asked for more guidance on chapter 2",
    time: "32m ago",
    kind: "comment",
  },
  {
    title: "Group Delta resumed activity",
    subtitle: "4 learners relaunched assigned labs today",
    time: "1h ago",
    kind: "group",
  },
  {
    title: "Linux PrivEsc received 2 dislikes",
    subtitle: "Negative feedback spike compared with yesterday",
    time: "3h ago",
    kind: "feedback",
  },
];

/* =========================
   HELPERS
========================= */
function trendStyles(trend: KpiItem["trend"]) {
  if (trend === "up") {
    return {
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      text: "text-emerald-300",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
    };
  }

  if (trend === "down") {
    return {
      icon: <TrendingDown className="h-3.5 w-3.5" />,
      text: "text-rose-300",
      bg: "bg-rose-400/10",
      border: "border-rose-400/20",
    };
  }

  return {
    icon: <ArrowRight className="h-3.5 w-3.5" />,
    text: "text-white/55",
    bg: "bg-white/5",
    border: "border-white/10",
  };
}

function accentStyles(accent: PerformanceCard["accent"]) {
  switch (accent) {
    case "blue":
      return {
        border: "border-sky-400/15",
        glow: "from-sky-400/12 via-sky-300/4 to-transparent",
        iconBg: "bg-sky-400/10",
        iconText: "text-sky-300",
      };
    case "orange":
      return {
        border: "border-orange-400/15",
        glow: "from-orange-400/12 via-orange-300/4 to-transparent",
        iconBg: "bg-orange-400/10",
        iconText: "text-orange-300",
      };
    case "rose":
      return {
        border: "border-rose-400/15",
        glow: "from-rose-400/12 via-rose-300/4 to-transparent",
        iconBg: "bg-rose-400/10",
        iconText: "text-rose-300",
      };
    default:
      return {
        border: "border-violet-400/15",
        glow: "from-violet-400/12 via-violet-300/4 to-transparent",
        iconBg: "bg-violet-400/10",
        iconText: "text-violet-300",
      };
  }
}

function activityDot(kind: ActivityItem["kind"]) {
  switch (kind) {
    case "launch":
      return "bg-sky-400";
    case "completion":
      return "bg-emerald-400";
    case "comment":
      return "bg-violet-400";
    case "group":
      return "bg-orange-400";
    case "feedback":
      return "bg-rose-400";
    default:
      return "bg-white/40";
  }
}

/* =========================
   MAIN
========================= */
export default function CreatorDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-white">
        <div className="animate-pulse text-white/50">Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white px-8 py-10 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-end justify-between gap-6"
      >
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
            Creator overview
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Dashboard
          </h1>

          <p className="max-w-2xl text-sm text-white/50">
            Monitor engagement, spot weak signals early, and identify where your
            content needs intervention.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md">
          <span className="text-xs text-white/45">Window</span>
          <button className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white/80">
            7d
          </button>
          <button className="rounded-lg px-3 py-1.5 text-xs text-white/45 hover:bg-white/5 hover:text-white/70 transition">
            30d
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-2 gap-4 md:grid-cols-5"
      >
        {kpis.map((item, index) => (
          <KpiCard key={item.label} item={item} index={index} />
        ))}
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.08 }}
          className="col-span-12 lg:col-span-7"
        >
          <DashboardCard className="relative overflow-hidden p-6">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-400/8 via-transparent to-transparent" />

            <div className="relative flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                  Trending
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  Most active content
                </h2>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/45">
                <Flame className="h-3.5 w-3.5 text-orange-300" />
                Live ranking
              </div>
            </div>

            <div className="space-y-3">
              {trendingContent.map((item, index) => (
                <motion.button
                  key={item.rank}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: 0.08 + index * 0.05 }}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4 text-left backdrop-blur-md hover:bg-white/[0.06] hover:border-white/15 transition group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white/75">
                        {item.rank}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {item.name}
                        </p>
                        <p className="truncate text-xs text-white/45 mt-1">
                          {item.meta}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-white/25 group-hover:text-white/55 transition" />
                  </div>
                </motion.button>
              ))}
            </div>
          </DashboardCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.1 }}
          className="col-span-12 lg:col-span-5"
        >
          <DashboardCard className="relative overflow-hidden p-6 h-full">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-400/8 via-transparent to-transparent" />

            <div className="relative flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                  Pulse
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  Quick status
                </h2>
              </div>

              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                Stable
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MiniStatusCard
                label="Public approval"
                value="78%"
                helper="likes vs dislikes"
              />
              <MiniStatusCard
                label="Group health"
                value="6 / 8"
                helper="currently active"
              />
              <MiniStatusCard
                label="Feedback queue"
                value="7"
                helper="comments pending"
              />
              <MiniStatusCard
                label="Attention"
                value="4"
                helper="alerts requiring action"
              />
            </div>
          </DashboardCard>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.44, delay: 0.12 }}
        className="grid grid-cols-12 gap-6"
      >
        <div className="col-span-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {performanceCards.map((item, index) => (
              <PerformanceInsightCard key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.46, delay: 0.16 }}
          className="col-span-12 lg:col-span-5"
        >
          <DashboardCard className="relative overflow-hidden p-6 h-full">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-400/8 via-transparent to-transparent" />

            <div className="relative flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                  Attention
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  Action required
                </h2>
              </div>

              <div className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs text-rose-300">
                {alerts.length} items
              </div>
            </div>

            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <AlertTile key={alert.title} alert={alert} index={index} />
              ))}
            </div>
          </DashboardCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.46, delay: 0.18 }}
          className="col-span-12 lg:col-span-7"
        >
          <DashboardCard className="relative overflow-hidden p-6 h-full">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-400/7 via-transparent to-transparent" />

            <div className="relative flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                  Timeline
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  Recent activity
                </h2>
              </div>

              <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/55 hover:bg-white/10 hover:text-white/80 transition">
                View full feed
              </button>
            </div>

            <div className="relative pl-3">
              <div className="absolute left-[7px] top-1 bottom-1 w-px bg-white/10" />

              <div className="space-y-4">
                {activities.map((item, index) => (
                  <ActivityRow key={`${item.title}-${index}`} item={item} index={index} />
                ))}
              </div>
            </div>
          </DashboardCard>
        </motion.div>
      </div>
    </div>
  );
}

/* =========================
   COMPONENTS
========================= */
function KpiCard({ item, index }: { item: KpiItem; index: number }) {
  const styles = trendStyles(item.trend);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.03 * index }}
    >
      <DashboardCard className="p-4 hover:bg-white/[0.06] transition">
        <div className="space-y-3">
          <p className="text-sm text-white/45">{item.label}</p>

          <div className="flex items-end justify-between gap-3">
            <p className="text-2xl font-semibold tracking-tight text-white">
              {item.value}
            </p>

            <div
              className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] ${styles.text} ${styles.bg} ${styles.border}`}
            >
              {styles.icon}
            </div>
          </div>

          <p className={`text-[11px] ${styles.text}`}>{item.delta}</p>
        </div>
      </DashboardCard>
    </motion.div>
  );
}

function MiniStatusCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-[11px] text-white/40">{helper}</p>
    </div>
  );
}

function PerformanceInsightCard({
  item,
  index,
}: {
  item: PerformanceCard;
  index: number;
}) {
  const styles = accentStyles(item.accent);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.04 * index }}
    >
      <DashboardCard className={`relative overflow-hidden p-5 hover:bg-white/[0.06] transition ${styles.border}`}>
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${styles.glow}`} />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">
              {item.title}
            </p>

            <p className="mt-3 text-lg font-medium text-white leading-tight">
              {item.value}
            </p>

            <p className="mt-2 text-sm text-white/45">
              {item.subtitle}
            </p>
          </div>

          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 ${styles.iconBg} ${styles.iconText}`}>
            {item.icon}
          </div>
        </div>
      </DashboardCard>
    </motion.div>
  );
}

function AlertTile({
  alert,
  index,
}: {
  alert: AlertCard;
  index: number;
}) {
  const tone =
    alert.severity === "high"
      ? "border-rose-400/20 bg-rose-400/8 text-rose-200"
      : alert.severity === "medium"
        ? "border-orange-400/20 bg-orange-400/8 text-orange-200"
        : "border-white/10 bg-white/[0.035] text-white/75";

  const badge =
    alert.severity === "high"
      ? "Critical"
      : alert.severity === "medium"
        ? "Warning"
        : "Note";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.24, delay: 0.05 * index }}
      className={`rounded-2xl border p-4 ${tone}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{alert.title}</p>
          <p className="mt-2 text-sm opacity-80">{alert.description}</p>
        </div>

        <div className="rounded-full border border-current/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] opacity-80">
          {badge}
        </div>
      </div>
    </motion.div>
  );
}

function ActivityRow({
  item,
  index,
}: {
  item: ActivityItem;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: 0.04 * index }}
      className="relative pl-6"
    >
      <span
        className={`absolute left-0 top-2 h-3 w-3 rounded-full ring-4 ring-[#0B0F19] ${activityDot(item.kind)}`}
      />

      <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4 hover:bg-white/[0.055] transition">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">{item.title}</p>
            <p className="mt-1 text-xs text-white/45">{item.subtitle}</p>
          </div>

          <div className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/45">
            {item.time}
          </div>
        </div>
      </div>
    </motion.div>
  );
}