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
  LogOut,
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
import { getCatalog, type MarketplaceItem } from "@/api/marketplace";
import type { AdminUser } from "@/api/types";
import { api } from "@/api";
import DashboardCard from "@/components/ui/DashboardCard";
import ConstellationArtwork from "@/components/gamification/ConstellationArtwork";
import type { Group } from "@/contracts/groups";
import type { Starpath } from "@/contracts/starpaths";
import { ALT_COLORS } from "@/lib/theme";
import { useAuth } from "@/context/useAuth";
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
  visibility: string;
  creatorId: string;
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
  visibility?: string | null;
  creator_id?: string | null;
  steps_count?: number | null;
  updated_at?: string | null;
  created_at?: string | null;
  updatedAt?: string | null;
}): AdminTemplate {
  return {
    id: raw.lab_id ?? raw.id ?? raw.template_id ?? "unknown",
    name: raw.name ?? "Untitled Template",
    description: raw.description ?? "No description",
    visibility: (raw.visibility ?? "unknown").toLowerCase(),
    creatorId: raw.creator_id ?? "unknown",
    stepsCount: raw.steps_count ?? 0,
    updatedAt: raw.updated_at ?? raw.updatedAt ?? raw.created_at ?? "Unknown",
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

  const label = status === "live" ? "Live" : status === "preview" ? "Read-only" : "To implement";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${config}`}>
      {label}
    </span>
  );
}

function ImplementationNotice({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <DashboardCard className="border border-orange-400/20 bg-orange-400/[0.06] p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-orange-300/20 bg-orange-300/10 text-orange-200">
          <Wrench className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-orange-100">{title}</p>
          <p className="mt-2 text-sm leading-6 text-orange-100/70">{description}</p>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {items.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-orange-300/15 bg-black/15 px-4 py-3 text-sm text-orange-100/75"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardCard>
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
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [starpaths, setStarpaths] = useState<Starpath[]>([]);
  const [starpathsLoading, setStarpathsLoading] = useState(true);
  const [starpathsError, setStarpathsError] = useState<string | null>(null);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(true);
  const [marketplaceError, setMarketplaceError] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userResults, setUserResults] = useState<AdminUser[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [userSearchError, setUserSearchError] = useState<string | null>(null);
  const [savingLabId, setSavingLabId] = useState<string | null>(null);
  const [savingGroupId, setSavingGroupId] = useState<string | null>(null);
  const [savingStarpathId, setSavingStarpathId] = useState<string | null>(null);
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
        const raw = await api.getAdminLabs({ visibility: "all", limit: 500 });
        if (!cancelled) {
          setTemplates(raw.items.map(normalizeTemplate));
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

    async function loadGroups() {
      try {
        const raw = await api.getAdminGroups({ limit: 500 });
        if (!cancelled) {
          setGroups(raw.items);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setGroupsError(getErrorMessage(err, "Could not load groups."));
        }
      } finally {
        if (!cancelled) {
          setGroupsLoading(false);
        }
      }
    }

    loadGroups();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadStarpaths() {
      try {
        const raw = await api.getAdminStarpaths({ visibility: "all", limit: 500 });
        if (!cancelled) {
          setStarpaths(raw.items);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setStarpathsError(getErrorMessage(err, "Could not load starpaths."));
        }
      } finally {
        if (!cancelled) {
          setStarpathsLoading(false);
        }
      }
    }

    loadStarpaths();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadMarketplace() {
      try {
        const data = await getCatalog();
        if (!cancelled) {
          setMarketplaceItems(data.items);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setMarketplaceError(getErrorMessage(err, "Could not load marketplace catalog."));
        }
      } finally {
        if (!cancelled) {
          setMarketplaceLoading(false);
        }
      }
    }

    loadMarketplace();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const query = userSearchQuery.trim();
    let cancelled = false;
    setUserSearchLoading(true);
    setUserSearchError(null);

    const timer = window.setTimeout(async () => {
      try {
        const results = await api.getAdminUsers({
          q: query || undefined,
          limit: 500,
        });
        if (!cancelled) {
          setUserResults(results.items);
          setUsersTotal(results.total);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setUserSearchError(getErrorMessage(err, "Could not search users."));
        }
      } finally {
        if (!cancelled) {
          setUserSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [userSearchQuery]);

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
    userCount: userSearchLoading ? "..." : usersTotal.toString(),
    labCount: templates.length.toString(),
    groupCount: groups.length.toString(),
    starpathCount: starpaths.length.toString(),
    alertCount: "TBD",
    capsuleCount: capsules.length,
    liveCapsuleCount: capsules.filter((capsule) => capsule.is_active).length,
    constellationCount: constellations.length,
    activeConstellationCount: constellations.filter((item) => item.is_active).length,
    marketplaceCount: marketplaceItems.length,
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
      title: "Account search",
      description: "Search and inspect existing users. Sanctions are not implemented yet.",
      icon: <Users className="h-4 w-4" />,
      status: "preview",
    },
    {
      id: "moderation",
      label: "Moderation",
      title: "Reports and intervention",
      description: "Report workflows do not exist in the backend yet.",
      icon: <Gavel className="h-4 w-4" />,
      status: "soon",
    },
    {
      id: "labs",
      label: "Labs",
      title: "Content supervision",
      description: "Inspect existing labs with the current gateway and labs service.",
      icon: <Layers className="h-4 w-4" />,
      status: "preview",
    },
    {
      id: "groups",
      label: "Groups",
      title: "Existing groups",
      description: "Read existing groups through the current groups service.",
      icon: <Users className="h-4 w-4" />,
      status: "preview",
    },
    {
      id: "starpaths",
      label: "Starpaths",
      title: "Existing routes",
      description: "Read existing starpaths through the current starpaths service.",
      icon: <Orbit className="h-4 w-4" />,
      status: "preview",
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
      title: "Catalog read-only",
      description: "Inspect the current marketplace catalog. Admin editing is not implemented.",
      icon: <ShoppingCart className="h-4 w-4" />,
      status: "preview",
    },
    {
      id: "analytics",
      label: "Analytics",
      title: "Platform signals",
      description: "Read-only counts from currently available endpoints.",
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

  const handleToggleLabVisibility = async (template: AdminTemplate) => {
    const nextVisibility = template.visibility === "public" ? "private" : "public";
    setSavingLabId(template.id);
    setFeedback(null);
    setError(null);

    try {
      const updated = await api.updateAdminLabVisibility(template.id, nextVisibility);
      setTemplates((current) =>
        current.map((entry) =>
          entry.id === template.id ? normalizeTemplate(updated) : entry,
        ),
      );
      setFeedback(`Lab "${updated.name}" is now ${nextVisibility}.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not update lab visibility."));
    } finally {
      setSavingLabId(null);
    }
  };

  const handleDeleteLab = async (template: AdminTemplate) => {
    const confirmed = window.confirm(`Delete lab "${template.name}" permanently?`);
    if (!confirmed) {
      return;
    }

    setSavingLabId(template.id);
    setFeedback(null);
    setError(null);

    try {
      await api.deleteLab(template.id);
      setTemplates((current) => current.filter((entry) => entry.id !== template.id));
      setFeedback(`Lab "${template.name}" deleted.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not delete lab."));
    } finally {
      setSavingLabId(null);
    }
  };

  const handleDeleteGroup = async (group: Group) => {
    const confirmed = window.confirm(`Delete group "${group.name}" permanently?`);
    if (!confirmed) {
      return;
    }

    setSavingGroupId(group.group_id);
    setFeedback(null);
    setError(null);

    try {
      await api.deleteGroup(group.group_id);
      setGroups((current) => current.filter((entry) => entry.group_id !== group.group_id));
      setFeedback(`Group "${group.name}" deleted.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not delete group."));
    } finally {
      setSavingGroupId(null);
    }
  };

  const handleToggleStarpathVisibility = async (starpath: Starpath) => {
    const currentVisibility = String(starpath.visibility).toLowerCase();
    const nextVisibility = currentVisibility === "public" ? "private" : "public";
    setSavingStarpathId(starpath.starpath_id);
    setFeedback(null);
    setError(null);

    try {
      const updated = await api.updateAdminStarpathVisibility(starpath.starpath_id, nextVisibility);
      setStarpaths((current) =>
        current.map((entry) => (entry.starpath_id === updated.starpath_id ? updated : entry)),
      );
      setFeedback(`Starpath "${updated.name}" is now ${nextVisibility}.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not update starpath visibility."));
    } finally {
      setSavingStarpathId(null);
    }
  };

  const handleDeleteStarpath = async (starpath: Starpath) => {
    const confirmed = window.confirm(`Delete starpath "${starpath.name}" permanently?`);
    if (!confirmed) {
      return;
    }

    setSavingStarpathId(starpath.starpath_id);
    setFeedback(null);
    setError(null);

    try {
      await api.deleteStarpath(starpath.starpath_id);
      setStarpaths((current) =>
        current.filter((entry) => entry.starpath_id !== starpath.starpath_id),
      );
      setFeedback(`Starpath "${starpath.name}" deleted.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not delete starpath."));
    } finally {
      setSavingStarpathId(null);
    }
  };

  function renderOverviewPanel() {
    return (
      <div className="space-y-6">
        <PanelTitle
          eyebrow="Global control"
          title="Admin dashboard"
          description="Supervise the parts that are already backed by real services. Missing moderation and operational features are marked as to implement."
          action={<StatusBadge status="preview" />}
        />

        <DashboardCard className="border border-white/10 p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-4">
              <p className="text-sm text-white/50">
                This admin surface now separates real read-only data from features that still need
                backend routes. No comments, likes, dislikes, or fake moderation data are shown.
              </p>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                <div className="flex items-center gap-3 text-white/55">
                  <Search className="h-4 w-4" />
                  <span className="text-sm">Use the panels to inspect real users, labs, groups, starpaths, marketplace, and gamification data.</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  ["Users", "users"],
                  ["Labs", "labs"],
                  ["Groups", "groups"],
                  ["Starpaths", "starpaths"],
                  ["Marketplace", "marketplace"],
                  ["Gamification", "gamification"],
                ].map(([filter, section]) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveSection(section as SectionId)}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/65 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MiniCard label="Real data" value="6 panels" helper="users, labs, groups, routes, market, game" />
              <MiniCard label="Reports" value="TBD" helper="no moderation backend yet" />
              <MiniCard label="Feedback" value="TBD" helper="no likes, dislikes, comments yet" />
              <MiniCard label="Current phase" value="Honest UI" helper="mock-only claims removed" />
            </div>
          </div>
        </DashboardCard>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
          <KpiCard label="Users" value={summary.userCount} helper="admin users endpoint" icon={<Users className="h-3.5 w-3.5 text-sky-300" />} />
          <KpiCard label="Labs" value={templatesLoading ? "..." : summary.labCount} helper="public and private labs" icon={<Layers className="h-3.5 w-3.5 text-orange-300" />} />
          <KpiCard label="Groups" value={groupsLoading ? "..." : summary.groupCount} helper="current groups endpoint" icon={<Users className="h-3.5 w-3.5 text-violet-300" />} />
          <KpiCard label="Starpaths" value={starpathsLoading ? "..." : summary.starpathCount} helper="current starpaths endpoint" icon={<Orbit className="h-3.5 w-3.5 text-emerald-300" />} />
          <KpiCard label="Reports" value={summary.alertCount} helper="needs moderation routes" icon={<AlertTriangle className="h-3.5 w-3.5 text-rose-300" />} />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <DashboardCard className="p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">Priority</p>
            <p className="mt-3 text-lg font-medium text-white">Users</p>
            <p className="mt-2 text-sm text-white/45">Search and inspect accounts. Sanctions require new backend support.</p>
          </DashboardCard>
          <DashboardCard className="p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">Priority</p>
            <p className="mt-3 text-lg font-medium text-white">Moderation</p>
            <p className="mt-2 text-sm text-white/45">To implement: learners cannot report content yet.</p>
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
          title="Users list"
          description="Search and inspect accounts. Role management stays outside the admin dashboard."
          action={<StatusBadge status="preview" />}
        />
        <DashboardCard className="border border-white/10 p-5">
          <label className="space-y-2 text-sm text-white/60">
            <span>Filter users</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                value={userSearchQuery}
                onChange={(event) => setUserSearchQuery(event.target.value)}
                placeholder="Pseudo, email, or name..."
                className={`${INPUT_CLASSNAME} pl-10`}
              />
            </div>
          </label>
        </DashboardCard>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_380px]">
          <div className="space-y-3">
            {userSearchLoading ? (
              <DashboardCard className="border border-white/10 p-5 text-sm text-white/45">
                Loading users...
              </DashboardCard>
            ) : userSearchError ? (
              <DashboardCard className="border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-100">
                {userSearchError}
              </DashboardCard>
            ) : userResults.length === 0 ? (
              <DashboardCard className="border border-white/10 p-5 text-sm text-white/45">
                No user found.
              </DashboardCard>
            ) : (
              userResults.map((user) => (
                <DashboardCard key={user.user_id} className="border border-white/10 p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {user.pseudo || user.name || user.email || user.user_id}
                      </p>
                      <p className="mt-1 truncate text-xs text-white/45">{user.email}</p>
                      <p className="mt-1 truncate text-[11px] text-white/30">{user.user_id}</p>
                    </div>
                    <div className="shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-white/55">
                      {user.role}
                    </div>
                  </div>
                </DashboardCard>
              ))
            )}
          </div>
          <DashboardCard className="p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">To implement</p>
            <div className="mt-4 space-y-3">
              <ActionTile title="Sanctions: warn, suspend, ban" description="No sanction model exists yet." tone="warning" />
              <ActionTile title="Owned content aggregation" description="Requires cross-service admin summary routes." />
              <ActionTile title="Full user profile" description="Needs richer admin user routes and activity aggregation." />
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
          title="To implement"
          description="Learners cannot report labs, groups, starpaths, or users yet. This panel is intentionally non-functional until moderation routes exist."
          action={<StatusBadge status="soon" />}
        />
        <ImplementationNotice
          title="Moderation backend missing"
          description="The UI should not show fake reports. Add report creation and admin review routes first, then this panel can become live."
          items={[
            "Reports: lab/group/starpath/user reporting",
            "Sanctions: warn/suspend/ban user",
            "Comments: review and moderation queue",
            "Likes/dislikes: feedback signals and abuse review",
          ]}
        />
      </div>
    );
  }

  function renderLabsPanel() {
    return (
      <div className="space-y-6">
        <PanelTitle
          eyebrow="Labs"
          title="Lab management"
          description="Inspect, publish, privatize, or delete labs with the current labs service permissions."
          action={<StatusBadge status="live" />}
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
                    {template.visibility}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/45">
                  <span className="truncate">Created {template.updatedAt}</span>
                  <span className="truncate">Creator {template.creatorId}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/creator/lab/${template.id}`)}
                    className="rounded-xl border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-xs font-semibold text-violet-200 transition hover:bg-violet-400/15"
                  >
                    Inspect lab
                  </button>
                  <button
                    type="button"
                    disabled={savingLabId === template.id}
                    onClick={() => handleToggleLabVisibility(template)}
                    className="rounded-xl border border-orange-400/20 bg-orange-400/10 px-3 py-2 text-xs font-semibold text-orange-200 transition hover:bg-orange-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {template.visibility === "public" ? "Make private" : "Make public"}
                  </button>
                  <button
                    type="button"
                    disabled={savingLabId === template.id}
                    onClick={() => handleDeleteLab(template)}
                    className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete
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
          title="Group management"
          description="Inspect all groups and remove groups when admin intervention is needed."
          action={<StatusBadge status="live" />}
        />
        {groupsLoading ? (
          <DashboardCard className="border border-white/10 p-5 text-sm text-white/45">Loading groups...</DashboardCard>
        ) : groupsError ? (
          <DashboardCard className="border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-100">{groupsError}</DashboardCard>
        ) : groups.length === 0 ? (
          <DashboardCard className="border border-white/10 p-5 text-sm text-white/45">No groups found.</DashboardCard>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {groups.map((group) => (
              <DashboardCard key={group.group_id} className="border border-white/10 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-white">{group.name}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-white/45">
                      {group.description ?? group.group_id}
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/45">
                    group
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/45">
                  <span className="truncate">Creator {group.creator_id}</span>
                  <span className="truncate">Created {group.created_at}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={savingGroupId === group.group_id}
                    onClick={() => handleDeleteGroup(group)}
                    className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </DashboardCard>
            ))}
          </div>
        )}
        <ImplementationNotice
          title="Group moderation actions to implement"
          description="Deletion is wired. Locking, reports, and a richer member/content drill-down still need dedicated admin screens."
          items={["Member drill-down", "Assigned labs/starpaths drill-down", "Report queue", "Suspend or lock group"]}
        />
      </div>
    );
  }

  function renderStarpathsPanel() {
    return (
      <div className="space-y-6">
        <PanelTitle
          eyebrow="Starpaths"
          title="Starpath management"
          description="Inspect, publish, privatize, or delete starpaths with current starpaths service permissions."
          action={<StatusBadge status="live" />}
        />
        {starpathsLoading ? (
          <DashboardCard className="border border-white/10 p-5 text-sm text-white/45">Loading starpaths...</DashboardCard>
        ) : starpathsError ? (
          <DashboardCard className="border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-100">{starpathsError}</DashboardCard>
        ) : starpaths.length === 0 ? (
          <DashboardCard className="border border-white/10 p-5 text-sm text-white/45">No starpaths found.</DashboardCard>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {starpaths.map((starpath) => {
              const visibility = String(starpath.visibility).toLowerCase();

              return (
                <DashboardCard key={starpath.starpath_id} className="border border-white/10 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-white">{starpath.name}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-white/45">
                        {starpath.description ?? starpath.starpath_id}
                      </p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/45">
                      {visibility}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/45">
                    <span className="truncate">Creator {starpath.creator_id}</span>
                    <span className="truncate">Created {starpath.created_at}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={savingStarpathId === starpath.starpath_id}
                      onClick={() => handleToggleStarpathVisibility(starpath)}
                      className="rounded-xl border border-orange-400/20 bg-orange-400/10 px-3 py-2 text-xs font-semibold text-orange-200 transition hover:bg-orange-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {visibility === "public" ? "Make private" : "Make public"}
                    </button>
                    <button
                      type="button"
                      disabled={savingStarpathId === starpath.starpath_id}
                      onClick={() => handleDeleteStarpath(starpath)}
                      className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </DashboardCard>
              );
            })}
          </div>
        )}
        <ImplementationNotice
          title="Route health to implement"
          description="The backend can list starpaths and their labs, but it does not yet expose admin health signals."
          items={["Broken lab references", "Completion/drop-off analytics", "Private route audit", "Archive lifecycle"]}
        />
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
          title="Catalog read-only"
          description="Inspect the current marketplace catalog through the existing gamification endpoint. Admin pricing and visibility edits are to implement."
          action={<StatusBadge status="preview" />}
        />
        <div className="grid gap-4 xl:grid-cols-3">
          <MiniCard
            label="Catalog items"
            value={marketplaceLoading ? "..." : marketplaceItems.length.toString()}
            helper="current marketplace endpoint"
          />
          <MiniCard
            label="Cosmetic types"
            value={
              marketplaceLoading
                ? "..."
                : new Set(marketplaceItems.map((item) => item.cosmetic_type)).size.toString()
            }
            helper="derived client-side"
          />
          <MiniCard label="Admin editing" value="TBD" helper="needs dedicated routes" />
        </div>
        {marketplaceLoading ? (
          <DashboardCard className="border border-white/10 p-5 text-sm text-white/45">Loading catalog...</DashboardCard>
        ) : marketplaceError ? (
          <DashboardCard className="border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-100">{marketplaceError}</DashboardCard>
        ) : marketplaceItems.length === 0 ? (
          <DashboardCard className="border border-white/10 p-5 text-sm text-white/45">No marketplace items found.</DashboardCard>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {marketplaceItems.map((item) => (
              <DashboardCard key={item.item_code} className="border border-white/10 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-white">{item.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/35">
                      {item.cosmetic_type} · {item.item_code}
                    </p>
                    {item.manifest.description ? (
                      <p className="mt-3 line-clamp-2 text-sm text-white/45">{item.manifest.description}</p>
                    ) : null}
                  </div>
                  <div className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60">
                    {item.price_starlight} starlight
                  </div>
                </div>
              </DashboardCard>
            ))}
          </div>
        )}
        <ImplementationNotice
          title="Marketplace admin editing to implement"
          description="The frontend can inspect the catalog today. Changing prices, visibility, or assets needs new admin routes in gamification."
          items={["Update price", "Toggle visibility", "Edit manifest/assets", "Audit purchase/ownership impact"]}
        />
      </div>
    );
  }

  function renderAnalyticsPanel() {
    return (
      <div className="space-y-6">
        <PanelTitle
          eyebrow="Analytics"
          title="Available signals"
          description="Client-side counts from endpoints already available to the admin dashboard. Usage, reports, and risk analytics are to implement."
          action={<StatusBadge status="preview" />}
        />
        <div className="grid gap-4 xl:grid-cols-4">
          <MiniCard label="Labs" value={templatesLoading ? "..." : templates.length.toString()} helper="real endpoint" />
          <MiniCard label="Groups" value={groupsLoading ? "..." : groups.length.toString()} helper="real endpoint" />
          <MiniCard label="Starpaths" value={starpathsLoading ? "..." : starpaths.length.toString()} helper="real endpoint" />
          <MiniCard label="Marketplace" value={marketplaceLoading ? "..." : marketplaceItems.length.toString()} helper="real endpoint" />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <DashboardCard className="p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">Derived now</p>
            <div className="mt-4 space-y-3">
              <ListTile title={`${summary.activeConstellationCount} active constellations`} subtitle="Computed from admin gamification data." />
              <ListTile title={`${summary.capsuleCount} capsules configured`} subtitle="Loaded from the gamification admin endpoint." />
              <ListTile title={`${summary.marketplaceCount} marketplace items`} subtitle="Loaded from the public catalog endpoint." />
            </div>
          </DashboardCard>
          <DashboardCard className="p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">To implement</p>
            <div className="mt-4 space-y-3">
              <ActionTile title="Usage analytics" description="Requires sessions aggregation routes." tone="warning" />
              <ActionTile title="Moderation analytics" description="Requires report tables and admin review routes." tone="warning" />
              <ActionTile title="Feedback analytics" description="Requires likes, dislikes, and comments models." tone="warning" />
              <ActionTile title="User risk signals" description="Requires user status, sanctions, or audit log models." />
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
          description="Feature flags, maintenance actions, exports, and security tools are not backed by routes yet."
          action={<StatusBadge status="soon" />}
        />
        <ImplementationNotice
          title="Operational admin backend missing"
          description="These controls should stay non-interactive until a route and permission model exists for each action."
          items={[
            "Feature flags",
            "Maintenance tools",
            "Audit exports",
            "Security actions",
          ]}
        />
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
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-xs font-medium text-rose-100 transition hover:border-rose-200/35 hover:bg-rose-400/15"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
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
