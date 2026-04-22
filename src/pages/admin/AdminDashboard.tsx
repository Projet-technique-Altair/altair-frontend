import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  CheckCircle2,
  FileText,
  Flag,
  FolderKanban,
  Gavel,
  Layers,
  Orbit,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Stars,
  Telescope,
  TrendingUp,
  UserX,
  Users,
  Wrench,
} from "lucide-react";
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
import backgroundimage from "@/assets/altair-bg-creator.png";

const RARITY_OPTIONS = ["common", "rare", "epic", "legendary"] as const;
const HEMISPHERE_OPTIONS = ["northern", "southern", "both", "unknown"] as const;
const ORION_ITEM_CODE = "constellation-orion";
const ORION_LEGENDARY_IMAGE = "constellations/orion-rare.png";

const INPUT_CLASSNAME =
  "w-full rounded-2xl border border-white/10 bg-[#121726]/90 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-sky-400/50 focus:bg-[#151b2d]";

type OrionPreviewStage = "base" | "legendary";

type AdminTemplate = {
  id: string;
  name: string;
  description: string;
  stepsCount: number;
  updatedAt: string;
};

type SectionId =
  | "overview"
  | "users"
  | "moderation"
  | "labs"
  | "groups"
  | "starpaths"
  | "gamification"
  | "marketplace"
  | "analytics"
  | "settings";

type SectionMeta = {
  id: SectionId;
  label: string;
  title: string;
  description: string;
  icon: ReactNode;
  status: "live" | "preview" | "soon";
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

function PanelTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function StatusBadge({ status }: { status: "live" | "preview" | "soon" }) {
  const config =
    status === "live"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
      : status === "preview"
        ? "border-sky-400/20 bg-sky-400/10 text-sky-300"
        : "border-white/10 bg-white/[0.05] text-white/55";

  const label = status === "live" ? "Live" : status === "preview" ? "Preview UI" : "Coming soon";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${config}`}>
      {label}
    </span>
  );
}

function StatusBanner({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: ReactNode;
}) {
  const isError = tone === "error";
  return (
    <DashboardCard
      className={[
        "border p-4",
        isError
          ? "border-rose-400/25 bg-rose-500/10 text-rose-100"
          : "border-emerald-400/25 bg-emerald-500/10 text-emerald-100",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            "mt-0.5 rounded-full border p-1.5",
            isError
              ? "border-rose-300/25 bg-rose-400/10 text-rose-200"
              : "border-emerald-300/25 bg-emerald-400/10 text-emerald-200",
          ].join(" ")}
        >
          {isError ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
        </div>
        <div className="text-sm">{children}</div>
      </div>
    </DashboardCard>
  );
}

function KpiCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
}) {
  return (
    <DashboardCard className="p-4 hover:bg-white/[0.06] transition">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-white/45">{label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</p>
          <p className="mt-2 text-[11px] text-white/45">{helper}</p>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/55">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
          {icon}
        </div>
      </div>
    </DashboardCard>
  );
}

function MiniCard({
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

function ActionTile({
  title,
  description,
  tone = "neutral",
}: {
  title: string;
  description: string;
  tone?: "neutral" | "warning" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "border-rose-400/20 bg-rose-400/8 text-rose-200"
      : tone === "warning"
        ? "border-orange-400/20 bg-orange-400/8 text-orange-200"
        : "border-white/10 bg-white/[0.035] text-white/75";

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-2 text-sm opacity-80">{description}</p>
    </div>
  );
}

function ListTile({
  title,
  subtitle,
  extra,
}: {
  title: string;
  subtitle: string;
  extra?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="mt-1 text-xs text-white/45">{subtitle}</p>
        </div>
        {extra ? (
          <div className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/45">
            {extra}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SideNav({
  sections,
  activeSection,
  onSelect,
}: {
  sections: SectionMeta[];
  activeSection: SectionId;
  onSelect: (section: SectionId) => void;
}) {
  return (
    <DashboardCard className="sticky top-4 border border-white/10 p-3">
      <div className="space-y-2">
        {sections.map((section) => {
          const active = section.id === activeSection;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelect(section.id)}
              className={[
                "flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-left transition",
                active
                  ? "border-sky-400/35 bg-sky-400/10"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20",
              ].join(" ")}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={[
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                    active
                      ? "border-sky-400/30 bg-sky-400/10 text-sky-300"
                      : "border-white/10 bg-white/5 text-white/75",
                  ].join(" ")}
                >
                  {section.icon}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{section.label}</p>
                  <p className="truncate text-[11px] text-white/40">{section.title}</p>
                </div>
              </div>
              <StatusBadge status={section.status} />
            </button>
          );
        })}
      </div>
    </DashboardCard>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [capsules, setCapsules] = useState<AdminCapsule[]>([]);
  const [constellations, setConstellations] = useState<AdminConstellation[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [gamificationLoading, setGamificationLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [savingCapsule, setSavingCapsule] = useState<string | null>(null);
  const [savingConstellation, setSavingConstellation] = useState<string | null>(null);
  const [orionPreviewStage, setOrionPreviewStage] = useState<OrionPreviewStage>("base");

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
          setTemplatesError(getErrorMessage(err, "Could not load labs."));
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

    async function loadGamification() {
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

    loadGamification();
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
    userCount: "2.4k",
    labCount: templates.length.toString(),
    groupCount: "184",
    starpathCount: "47",
    alertCount: "12",
    capsuleCount: capsules.length,
    liveCapsuleCount: capsules.filter((capsule) => capsule.is_active).length,
    constellationCount: constellations.length,
    activeConstellationCount: constellations.filter((item) => item.is_active).length,
  };

  const sections: SectionMeta[] = [
    {
      id: "overview",
      label: "Overview",
      title: "Global control",
      description: "Platform-wide supervision and quick access.",
      icon: <ShieldCheck className="h-4 w-4" />,
      status: "preview",
    },
    {
      id: "users",
      label: "Users",
      title: "Accounts and sanctions",
      description: "Inspect roles, behavior, and admin actions.",
      icon: <Users className="h-4 w-4" />,
      status: "preview",
    },
    {
      id: "moderation",
      label: "Moderation",
      title: "Reports and intervention",
      description: "Flagged content and enforcement workflows.",
      icon: <Gavel className="h-4 w-4" />,
      status: "preview",
    },
    {
      id: "labs",
      label: "Labs",
      title: "Content supervision",
      description: "Inspect all labs, public or private.",
      icon: <Layers className="h-4 w-4" />,
      status: "preview",
    },
    {
      id: "groups",
      label: "Groups",
      title: "Private and public spaces",
      description: "Membership, activity, and intervention scope.",
      icon: <Users className="h-4 w-4" />,
      status: "soon",
    },
    {
      id: "starpaths",
      label: "Starpaths",
      title: "Route inspection",
      description: "Learning route structure and health.",
      icon: <Orbit className="h-4 w-4" />,
      status: "soon",
    },
    {
      id: "gamification",
      label: "Gamification",
      title: "Economy and collection",
      description: "Capsules and constellations already editable.",
      icon: <Sparkles className="h-4 w-4" />,
      status: "live",
    },
    {
      id: "marketplace",
      label: "Marketplace",
      title: "Catalog control",
      description: "Pricing, visibility, and asset moderation.",
      icon: <ShoppingCart className="h-4 w-4" />,
      status: "preview",
    },
    {
      id: "analytics",
      label: "Analytics",
      title: "Platform signals",
      description: "Usage, risk, and health overview.",
      icon: <BarChart3 className="h-4 w-4" />,
      status: "preview",
    },
    {
      id: "settings",
      label: "Settings",
      title: "Operational tools",
      description: "Feature flags and admin-only controls.",
      icon: <Wrench className="h-4 w-4" />,
      status: "soon",
    },
  ];

  const activeMeta = sections.find((section) => section.id === activeSection) ?? sections[0];

  const updateCapsuleField = (
    capsuleType: string,
    field: keyof AdminCapsule,
    value: string | number | boolean,
  ) => {
    setCapsules((current) =>
      current.map((capsule) =>
        capsule.capsule_type === capsuleType ? { ...capsule, [field]: value } : capsule,
      ),
    );
  };

  const updateConstellationField = (
    itemCode: string,
    field: keyof AdminConstellation,
    value: string | number | boolean,
  ) => {
    setConstellations((current) =>
      current.map((item) => (item.item_code === itemCode ? { ...item, [field]: value } : item)),
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

  function renderOverviewPanel() {
    return (
      <div className="space-y-6">
        <PanelTitle
          eyebrow="Global control"
          title="Admin dashboard"
          description="Supervise users, moderation, labs, groups, starpaths, private spaces, gamification, and operations from a single admin route."
          action={<StatusBadge status="preview" />}
        />

        <DashboardCard className="border border-white/10 p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-4">
              <p className="text-sm text-white/50">
                This version switches the admin from a long scrolling page to a panel-based workspace.
                Each click changes the visible control surface while keeping the same route.
              </p>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                <div className="flex items-center gap-3 text-white/55">
                  <Search className="h-4 w-4" />
                  <span className="text-sm">Search a user, lab, group, starpath, or moderation case...</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Users", "Labs", "Groups", "Starpaths", "Reports", "Private spaces"].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/65 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MiniCard label="Search scope" value="Global" helper="users, content, private spaces" />
              <MiniCard label="Admin reach" value="Full" helper="platform-wide supervision" />
              <MiniCard label="Layout" value="Panels" helper="one route, many views" />
              <MiniCard label="Current phase" value="UI" helper="functional backend later" />
            </div>
          </div>
        </DashboardCard>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
          <KpiCard label="Users" value={summary.userCount} helper="global user base" icon={<Users className="h-3.5 w-3.5 text-sky-300" />} />
          <KpiCard label="Labs" value={summary.labCount} helper="visible content" icon={<Layers className="h-3.5 w-3.5 text-orange-300" />} />
          <KpiCard label="Groups" value={summary.groupCount} helper="private and public" icon={<Users className="h-3.5 w-3.5 text-violet-300" />} />
          <KpiCard label="Starpaths" value={summary.starpathCount} helper="route supervision" icon={<Orbit className="h-3.5 w-3.5 text-emerald-300" />} />
          <KpiCard label="Alerts" value={summary.alertCount} helper="open admin signals" icon={<AlertTriangle className="h-3.5 w-3.5 text-rose-300" />} />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <DashboardCard className="p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">Priority</p>
            <p className="mt-3 text-lg font-medium text-white">Users and sanctions</p>
            <p className="mt-2 text-sm text-white/45">Inspect profiles, roles, behavior, and moderation outcomes.</p>
          </DashboardCard>
          <DashboardCard className="p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">Priority</p>
            <p className="mt-3 text-lg font-medium text-white">Content moderation</p>
            <p className="mt-2 text-sm text-white/45">Review labs, groups, and routes that need intervention.</p>
          </DashboardCard>
          <DashboardCard className="p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">Priority</p>
            <p className="mt-3 text-lg font-medium text-white">Gamification control</p>
            <p className="mt-2 text-sm text-white/45">Tune economy and editable collection content already wired.</p>
          </DashboardCard>
        </div>
      </div>
    );
  }

  function renderUsersPanel() {
    return (
      <div className="space-y-6">
        <PanelTitle
          eyebrow="Users"
          title="User control center"
          description="An admin should inspect accounts, roles, sanctions, owned labs, groups, starpaths, and private visibility scope."
          action={<StatusBadge status="preview" />}
        />
        <div className="grid gap-4 xl:grid-cols-4">
          <MiniCard label="Total users" value="2,438" helper="full platform audience" />
          <MiniCard label="Creators" value="116" helper="content publishers" />
          <MiniCard label="Suspended" value="9" helper="sanctioned accounts" />
          <MiniCard label="Pending review" value="14" helper="needs moderator attention" />
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_380px]">
          <div className="space-y-3">
            <ListTile title="Lina Moreau" subtitle="creator · 12 labs · 4 starpaths · 3 private groups" extra="Watchlisted" />
            <ListTile title="Theo Martin" subtitle="learner · 26 sessions · 2 groups · 1 warning" extra="Support" />
            <ListTile title="Nora Petit" subtitle="admin · support actions · escalation access" extra="Admin" />
          </div>
          <DashboardCard className="p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">Expected admin actions</p>
            <div className="mt-4 space-y-3">
              <ActionTile title="Open a full user profile" description="One place for identity, activity, sanctions, and owned content." />
              <ActionTile title="Review labs, groups, and starpaths tied to the user" description="Even private scope when policy allows it." />
              <ActionTile title="Warn, suspend, ban, or change role" description="Moderation-first admin behavior." tone="warning" />
            </div>
          </DashboardCard>
        </div>
      </div>
    );
  }

  function renderModerationPanel() {
    return (
      <div className="space-y-6">
        <PanelTitle
          eyebrow="Moderation"
          title="Reports and intervention"
          description="Surface reports, abusive behavior, hidden content, and escalations before everything else."
          action={<StatusBadge status="preview" />}
        />
        <div className="grid gap-4 xl:grid-cols-[460px_minmax(0,1fr)]">
          <div className="space-y-3">
            <ActionTile title="3 labs reported by learners" description="Two private labs and one public lab require manual review." tone="danger" />
            <ActionTile title="2 users reached warning threshold" description="Repeated misconduct patterns require escalation or ban review." tone="warning" />
            <ActionTile title="1 private group inspected manually" description="Admin review triggered after a content complaint." />
          </div>
          <DashboardCard className="p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">Recent moderation timeline</p>
            <div className="mt-4 space-y-3">
              <ListTile title="Lab hidden pending review" subtitle="Private lab removed from visibility after report escalation." extra="12m" />
              <ListTile title="Warning issued to creator account" subtitle="Pattern of repeated policy violations captured." extra="48m" />
              <ListTile title="Private group manually inspected" subtitle="Admin accessed the group after moderation alert." extra="2h" />
            </div>
          </DashboardCard>
        </div>
      </div>
    );
  }

  function renderLabsPanel() {
    return (
      <div className="space-y-6">
        <PanelTitle
          eyebrow="Labs"
          title="Lab management"
          description="Inspect all labs, including private ones, then hide, archive, or remove them when needed."
          action={<StatusBadge status="preview" />}
        />
        {templatesLoading ? (
          <p className="text-sm italic text-white/40">Loading labs...</p>
        ) : templatesError ? (
          <p className="text-sm text-rose-200">{templatesError}</p>
        ) : templates.length === 0 ? (
          <p className="text-sm italic text-white/40">No labs found.</p>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/15 hover:bg-white/[0.06]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-white">{template.name}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-white/45">{template.description}</p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/45">
                    {template.stepsCount} steps
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/45">
                  <span className="truncate">Updated {template.updatedAt}</span>
                  <span className="truncate">{template.id}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" className="rounded-xl border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-xs font-semibold text-violet-200 transition hover:bg-violet-400/15">
                    Inspect lab
                  </button>
                  <button type="button" className="rounded-xl border border-orange-400/20 bg-orange-400/10 px-3 py-2 text-xs font-semibold text-orange-200 transition hover:bg-orange-400/15">
                    Hide / archive
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/15"
                  >
                    Remove locally
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderGroupsPanel() {
    return (
      <div className="space-y-6">
        <PanelTitle
          eyebrow="Groups"
          title="Group supervision"
          description="Inspect private groups, memberships, assigned content, activity health, and intervention points."
          action={<StatusBadge status="soon" />}
        />
        <div className="grid gap-4 xl:grid-cols-2">
          <ActionTile title="Inspect private groups" description="Admin should see private spaces when policy allows it." />
          <ActionTile title="View memberships and owners" description="Understand who controls the group and who is affected." />
          <ActionTile title="See labs and starpaths assigned" description="Audit all related content from the same panel." />
          <ActionTile title="Suspend or intervene if necessary" description="Moderation and operational control should remain possible." tone="warning" />
        </div>
      </div>
    );
  }

  function renderStarpathsPanel() {
    return (
      <div className="space-y-6">
        <PanelTitle
          eyebrow="Starpaths"
          title="Route supervision"
          description="Review route structure, broken composition, hidden dependencies, and private learning paths."
          action={<StatusBadge status="soon" />}
        />
        <div className="grid gap-4 xl:grid-cols-2">
          <ActionTile title="Review all starpaths" description="A global route view should exist for admins." />
          <ActionTile title="Audit route composition" description="Detect broken sequencing and missing labs." />
          <ActionTile title="Inspect private learning routes" description="Admin access should extend beyond public content." />
          <ActionTile title="Detect broken lab references" description="Surface invalid route dependencies early." tone="warning" />
        </div>
      </div>
    );
  }

  function renderGamificationPanel() {
    return (
      <div className="space-y-6">
        <PanelTitle
          eyebrow="Gamification"
          title="Control room"
          description="This is the currently wired admin area: capsule economy, constellation metadata, and collection-facing content."
          action={
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="live" />
              <button
                type="button"
                onClick={() => navigate("/learner/gacha")}
                className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/25 hover:bg-white/[0.07] hover:text-white"
              >
                Open Gacha Preview
              </button>
              <button
                type="button"
                onClick={() => navigate("/learner/collection")}
                className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
                style={{ background: `linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})` }}
              >
                Open Collection Preview
              </button>
            </div>
          }
        />

        {gamificationLoading ? (
          <DashboardCard className="border border-white/10 p-6 text-sm text-white/40">
            Loading gamification control room...
          </DashboardCard>
        ) : (
          <>
            <div className="grid gap-4 xl:grid-cols-3">
              <MiniCard label="Capsules" value={summary.capsuleCount.toString()} helper="editable economy objects" />
              <MiniCard label="Constellations" value={summary.constellationCount.toString()} helper="catalog content" />
              <MiniCard label="Visible in gacha" value={summary.activeConstellationCount.toString()} helper="currently live items" />
            </div>

            <DashboardCard className="border border-white/10 p-6">
              <PanelTitle
                eyebrow="Economy"
                title="Capsule tuning"
                description="Pricing, drop rates, pity thresholds, and activation state are already wired here."
                action={
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white/45">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-sky-300" />
                    Live tuning
                  </div>
                }
              />

              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                {capsules.map((capsule) => (
                  <div
                    key={capsule.capsule_type}
                    className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">Capsule</p>
                        <h3 className="mt-1 text-lg font-semibold text-white">{capsule.capsule_type}</h3>
                        <p className="mt-1 text-sm text-white/45">
                          Control pricing, rarity curves, and pity safety nets.
                        </p>
                      </div>

                      <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/65">
                        <input
                          type="checkbox"
                          checked={capsule.is_active}
                          onChange={(e) =>
                            updateCapsuleField(capsule.capsule_type, "is_active", e.target.checked)
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
                        <label key={field} className="space-y-1.5 text-sm text-white/60">
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
                            className={INPUT_CLASSNAME}
                          />
                        </label>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <div className="text-xs text-white/35">Existing update action is kept intact.</div>
                      <button
                        type="button"
                        onClick={() => saveCapsule(capsule)}
                        disabled={savingCapsule === capsule.capsule_type}
                        className="rounded-2xl bg-gradient-to-r from-sky-500 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingCapsule === capsule.capsule_type ? "Saving..." : "Save capsule"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>

            <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
              <DashboardCard className="border border-white/10 p-5">
                <PanelTitle
                  eyebrow="Catalog"
                  title="Constellations"
                  description="Choose an item and edit how it appears in gacha and collection."
                />

                <div className="mt-5 max-h-[760px] space-y-2 overflow-y-auto pr-1">
                  {constellations.map((item) => {
                    const isActive = item.item_code === selectedConstellation?.item_code;
                    return (
                      <button
                        key={item.item_code}
                        type="button"
                        onClick={() => setSelectedCode(item.item_code)}
                        className={[
                          "w-full rounded-2xl border px-4 py-3 text-left transition",
                          isActive
                            ? "border-violet-400/45 bg-violet-400/10"
                            : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">{item.name}</p>
                            <p className="truncate text-xs uppercase tracking-[0.18em] text-white/35">
                              {item.rarity} · {item.capsule_type}
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

              <DashboardCard className="border border-white/10 p-6">
                {!selectedConstellation ? (
                  <div className="flex min-h-[420px] items-center justify-center text-white/40">
                    No constellation selected.
                  </div>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <div className="space-y-4">
                      <PanelTitle
                        eyebrow="Preview"
                        title={selectedConstellation.name}
                        description="Artwork and progression preview for the currently selected constellation."
                      />

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

                      {isOrionSelected ? (
                        <div className="rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
                          <div className="flex items-center gap-2 text-amber-100/80">
                            <Telescope className="h-4 w-4" />
                            <p className="text-xs uppercase tracking-[0.22em]">Orion evolution preview</p>
                          </div>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {[
                              ["base", "3-star Base"],
                              ["legendary", "4-star to 6-star Legendary"],
                            ].map(([stage, label]) => (
                              <button
                                key={stage}
                                type="button"
                                onClick={() => setOrionPreviewStage(stage as OrionPreviewStage)}
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
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-4">
                      <PanelTitle
                        eyebrow="Editor"
                        title="Constellation content"
                        description="Existing admin fields for gacha, collection, editorial, and source content."
                        action={<StatusBadge status="live" />}
                      />

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-1.5 text-sm text-white/60">
                          <span>Name</span>
                          <input
                            value={selectedConstellation.name}
                            onChange={(e) =>
                              updateConstellationField(selectedConstellation.item_code, "name", e.target.value)
                            }
                            className={INPUT_CLASSNAME}
                          />
                        </label>
                        <label className="space-y-1.5 text-sm text-white/60">
                          <span>Rarity</span>
                          <select
                            value={selectedConstellation.rarity}
                            onChange={(e) =>
                              updateConstellationField(selectedConstellation.item_code, "rarity", e.target.value)
                            }
                            className={INPUT_CLASSNAME}
                          >
                            {RARITY_OPTIONS.map((rarity) => (
                              <option key={rarity} value={rarity}>
                                {rarity}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-1.5 text-sm text-white/60">
                          <span>Hemisphere</span>
                          <select
                            value={selectedConstellation.hemisphere}
                            onChange={(e) =>
                              updateConstellationField(selectedConstellation.item_code, "hemisphere", e.target.value)
                            }
                            className={INPUT_CLASSNAME}
                          >
                            {HEMISPHERE_OPTIONS.map((hemisphere) => (
                              <option key={hemisphere} value={hemisphere}>
                                {hemisphere}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-1.5 text-sm text-white/60">
                          <span>Weight</span>
                          <input
                            type="number"
                            value={selectedConstellation.weight}
                            onChange={(e) =>
                              updateConstellationField(selectedConstellation.item_code, "weight", Number(e.target.value))
                            }
                            className={INPUT_CLASSNAME}
                          />
                        </label>
                      </div>

                      <label className="space-y-1.5 text-sm text-white/60">
                        <span>Asset path</span>
                        <input
                          value={selectedConstellation.image_url}
                          onChange={(e) =>
                            updateConstellationField(selectedConstellation.item_code, "image_url", e.target.value)
                          }
                          className={INPUT_CLASSNAME}
                        />
                      </label>

                      <label className="space-y-1.5 text-sm text-white/60">
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
                          className={INPUT_CLASSNAME}
                        />
                      </label>

                      <label className="space-y-1.5 text-sm text-white/60">
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
                          className={INPUT_CLASSNAME}
                        />
                      </label>

                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs text-white/35">Current admin save flow preserved.</div>
                        <button
                          type="button"
                          onClick={() => saveConstellation(selectedConstellation)}
                          disabled={savingConstellation === selectedConstellation.item_code}
                          className="rounded-2xl bg-gradient-to-r from-purple-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingConstellation === selectedConstellation.item_code ? "Saving..." : "Save constellation"}
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
    );
  }

  function renderMarketplacePanel() {
    return (
      <div className="space-y-6">
        <PanelTitle
          eyebrow="Marketplace"
          title="Catalog supervision"
          description="Prepare cosmetic catalog management, visibility, pricing, and moderation of marketplace assets."
          action={<StatusBadge status="preview" />}
        />
        <div className="grid gap-4 xl:grid-cols-2">
          <ActionTile title="Review catalog items" description="The admin should inspect all visible and hidden products." />
          <ActionTile title="Control pricing and visibility" description="Marketplace settings belong to admin-level supervision." />
          <ActionTile title="Audit owned vs hidden cosmetics" description="Understand catalog state and user-facing consequences." />
          <ActionTile title="Inspect preview assets" description="Moderate cosmetic media and presentation quality." />
        </div>
      </div>
    );
  }

  function renderAnalyticsPanel() {
    return (
      <div className="space-y-6">
        <PanelTitle
          eyebrow="Analytics"
          title="Platform signals"
          description="Summarize usage, moderation load, user health, content health, and economy trends."
          action={<StatusBadge status="preview" />}
        />
        <div className="grid gap-4 xl:grid-cols-4">
          <MiniCard label="User risk signals" value="14" helper="accounts needing review" />
          <MiniCard label="Flagged content" value="7" helper="labs and spaces under review" />
          <MiniCard label="Route health" value="93%" helper="starpaths structurally healthy" />
          <MiniCard label="Economy" value="Stable" helper="capsules and collection layer" />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <DashboardCard className="p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">Signals this week</p>
            <div className="mt-4 space-y-3">
              <ListTile title="Moderation spikes on creator content" subtitle="Higher report volume detected on private training material." />
              <ListTile title="Marketplace visibility mismatch" subtitle="Some cosmetics may need better lifecycle controls." />
              <ListTile title="Healthy route completion" subtitle="Current starpath structure looks stable overall." />
            </div>
          </DashboardCard>
          <DashboardCard className="p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">What this panel should grow into</p>
            <div className="mt-4 space-y-3">
              <ActionTile title="Global KPIs" description="Users, labs, groups, starpaths, moderation, and gamification." />
              <ActionTile title="Risk and health layers" description="Spot issues before they become operational problems." />
              <ActionTile title="Cross-platform visibility" description="Admin needs one place for platform-wide understanding." />
            </div>
          </DashboardCard>
        </div>
      </div>
    );
  }

  function renderSettingsPanel() {
    return (
      <div className="space-y-6">
        <PanelTitle
          eyebrow="Settings"
          title="Operational tools"
          description="Reserve space for admin-only controls, feature flags, maintenance, exports, and security actions."
          action={<StatusBadge status="soon" />}
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { title: "Feature flags", icon: <Settings2 className="h-4 w-4" /> },
            { title: "Maintenance tools", icon: <Wrench className="h-4 w-4" /> },
            { title: "Audit exports", icon: <FolderKanban className="h-4 w-4" /> },
            { title: "Security actions", icon: <UserX className="h-4 w-4" /> },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/75">
                {item.icon}
              </div>
              <p className="mt-4 text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-1 text-xs text-white/45">Reserved for future admin-only controls.</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderActivePanel() {
    switch (activeSection) {
      case "users":
        return renderUsersPanel();
      case "moderation":
        return renderModerationPanel();
      case "labs":
        return renderLabsPanel();
      case "groups":
        return renderGroupsPanel();
      case "starpaths":
        return renderStarpathsPanel();
      case "gamification":
        return renderGamificationPanel();
      case "marketplace":
        return renderMarketplacePanel();
      case "analytics":
        return renderAnalyticsPanel();
      case "settings":
        return renderSettingsPanel();
      default:
        return renderOverviewPanel();
    }
  }

  if (templatesLoading && gamificationLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <ShieldCheck className="h-6 w-6 text-sky-300" />
          </div>
          <div className="animate-pulse text-white/50">Loading admin workspace...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden px-6 py-8 text-white sm:px-8 sm:py-10"
      style={{
        backgroundImage: `url(${backgroundimage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(42,167,255,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(122,44,243,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,140,74,0.12),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-500/12 via-purple-500/8 to-transparent blur-3xl" />

      <div className="relative z-10 mx-auto max-w-[1800px] space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"
        >
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">Admin workspace</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Dashboard</h1>
            <p className="max-w-3xl text-sm text-white/50">
              Switch between admin panels without leaving the route. The workspace now behaves
              more like a true control console than a long static page.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge status={activeMeta.status} />
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/55">
              Active panel: {activeMeta.label}
            </div>
          </div>
        </motion.div>

        {error ? <StatusBanner tone="error">{error}</StatusBanner> : null}
        {!error && feedback ? <StatusBanner tone="success">{feedback}</StatusBanner> : null}

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <SideNav sections={sections} activeSection={activeSection} onSelect={setActiveSection} />

          <DashboardCard className="border border-white/10 p-6 sm:p-7">
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80">
                      {activeMeta.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{activeMeta.title}</p>
                      <p className="text-xs text-white/45">{activeMeta.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => setActiveSection(section.id)}
                        className={[
                          "rounded-full border px-3 py-1.5 text-xs transition",
                          section.id === activeSection
                            ? "border-sky-400/35 bg-sky-400/10 text-sky-200"
                            : "border-white/10 bg-white/[0.03] text-white/55 hover:bg-white/[0.07] hover:text-white",
                        ].join(" ")}
                      >
                        {section.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {renderActivePanel()}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
