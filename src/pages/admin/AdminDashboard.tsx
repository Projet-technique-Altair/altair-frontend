import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Gavel,
  Layers,
  LogOut,
  Orbit,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Telescope,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import {
  getAdminGamificationDashboard,
  getAdminEconomyAnalytics,
  updateAdminCapsule,
  updateAdminConstellation,
  type AdminCapsule,
  type AdminConstellation,
  type AdminEconomyAnalytics,
} from "@/api/adminGamification";
import {
  getAdminMarketplaceCatalog,
  getAdminMarketplaceItemImpact,
  getCatalog,
  updateAdminMarketplaceItem,
  type MarketplaceItem,
} from "@/api/marketplace";
import type { AdminUser, AdminUserDetail, UserAuditLog } from "@/api/types";
import type { AdminSessionsAnalytics, LearnerDashboardLab, SessionSummary } from "@/api/sessions";
import type { AuditEvent, ModerationReport, ReportStatus } from "@/api/moderation";
import { api } from "@/api";
import type { AdminGroupDetail } from "@/api/groups";
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
const GAMIFICATION_INPUT_CLASSNAME =
  "w-full rounded-xl border border-white/15 bg-[#0f1422] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/25 focus:border-sky-300/70 focus:bg-[#121a2b] focus:ring-2 focus:ring-sky-300/10";
const GAMIFICATION_PRIMARY_BUTTON_CLASSNAME =
  "rounded-xl border border-sky-300/30 bg-sky-400/12 px-4 py-2.5 text-sm font-semibold text-sky-100 transition hover:border-sky-200/45 hover:bg-sky-400/18 disabled:cursor-not-allowed disabled:opacity-60";

function humanizeAuditAction(action: string) {
  const knownActions: Record<string, string> = {
    "user.account_status.updated": "Account status updated",
    "user.sanction.created": "Sanction created",
    "moderation.report.created": "Report created",
    "moderation.report.assigned": "Report assigned",
    "moderation.report.status.updated": "Report status updated",
    "moderation.report.bulk.updated": "Reports bulk updated",
  };

  if (knownActions[action]) {
    return knownActions[action];
  }

  return action
    .split(".")
    .filter(Boolean)
    .slice(-3)
    .join(" ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatAuditMetadataValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function formatUserAuditMetadata(entry: UserAuditLog) {
  const metadata = entry.metadata ?? {};

  if (entry.action === "user.account_status.updated") {
    const status = formatAuditMetadataValue(metadata.account_status);
    const reason = formatAuditMetadataValue(metadata.reason);
    return [status ? `Status: ${status}` : null, reason ? `Reason: ${reason}` : null]
      .filter(Boolean)
      .join(" · ");
  }

  if (entry.action === "user.sanction.created") {
    const action = formatAuditMetadataValue(metadata.action);
    const reason = formatAuditMetadataValue(metadata.reason);
    const expiresAt = formatAuditMetadataValue(metadata.expires_at);
    return [
      action ? `Action: ${action}` : null,
      reason ? `Reason: ${reason}` : null,
      expiresAt ? `Expires: ${new Date(expiresAt).toLocaleDateString()}` : null,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  const summary = Object.entries(metadata)
    .map(([key, value]) => {
      const formatted = formatAuditMetadataValue(value);
      return formatted ? `${key.replace(/_/g, " ")}: ${formatted}` : null;
    })
    .filter(Boolean)
    .slice(0, 3)
    .join(" · ");

  return summary || "No details";
}

type OrionPreviewStage = "base" | "legendary";

type AdminTemplate = {
  id: string;
  name: string;
  description: string;
  visibility: string;
  creatorId: string;
  stepsCount: number;
  contentStatus: string;
  updatedAt: string;
};

type AdminStarpathProgress = {
  user_id: string;
  starpath_id: string;
  current_position: number;
  status: string;
  started_at: string;
  completed_at?: string | null;
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
  status: "live" | "read-only";
};

type ConfirmationState = {
  title: string;
  message: string;
  confirmLabel: string;
  tone?: "danger" | "warning";
  onConfirm: () => Promise<void>;
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
  content_status?: string | null;
}): AdminTemplate {
  return {
    id: raw.lab_id ?? raw.id ?? raw.template_id ?? "unknown",
    name: raw.name ?? "Untitled Template",
    description: raw.description ?? "No description",
    visibility: (raw.visibility ?? "unknown").toLowerCase(),
    creatorId: raw.creator_id ?? "unknown",
    stepsCount: raw.steps_count ?? 0,
    contentStatus: raw.content_status ?? "active",
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

function StatusBadge({ status }: { status: "live" | "read-only" | "mock" }) {
  const config =
    status === "live"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
      : status === "read-only"
        ? "border-sky-400/20 bg-sky-400/10 text-sky-300"
        : "border-white/10 bg-white/[0.05] text-white/55";

  const label = status === "live" ? "Live" : status === "read-only" ? "Read-only" : "Mock";

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
    <div className={`cursor-default rounded-2xl border p-4 ${toneClass}`}>
      <div className="flex items-start gap-3">
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-current opacity-60" />
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-2 text-sm opacity-80">{description}</p>
        </div>
      </div>
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
  const [marketplaceImpacts, setMarketplaceImpacts] = useState<Record<string, { purchases: number; owners: number }>>({});
  const [marketplaceLoading, setMarketplaceLoading] = useState(true);
  const [marketplaceError, setMarketplaceError] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userResults, setUserResults] = useState<AdminUser[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [userSearchError, setUserSearchError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUserDetail | null>(null);
  const [selectedUserSessions, setSelectedUserSessions] = useState<SessionSummary[]>([]);
  const [selectedUserLabs, setSelectedUserLabs] = useState<LearnerDashboardLab[]>([]);
  const [selectedUserGroups, setSelectedUserGroups] = useState<Group[]>([]);
  const [selectedUserStarpathProgress, setSelectedUserStarpathProgress] = useState<AdminStarpathProgress[]>([]);
  const [selectedUserLoading, setSelectedUserLoading] = useState(false);
  const [selectedUserError, setSelectedUserError] = useState<string | null>(null);
  const [sanctionAction, setSanctionAction] = useState<"warn" | "suspend" | "ban">("warn");
  const [sanctionReason, setSanctionReason] = useState("");
  const [sanctionDurationDays, setSanctionDurationDays] = useState(7);
  const [savingUserAction, setSavingUserAction] = useState(false);
  const [savingLabId, setSavingLabId] = useState<string | null>(null);
  const [savingGroupId, setSavingGroupId] = useState<string | null>(null);
  const [selectedGroupDetail, setSelectedGroupDetail] = useState<AdminGroupDetail | null>(null);
  const [groupDetailError, setGroupDetailError] = useState<string | null>(null);
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
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [reportsTotal, setReportsTotal] = useState(0);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [reportStatusFilter, setReportStatusFilter] = useState<ReportStatus | "all">("open");
  const [reportTargetFilter, setReportTargetFilter] = useState("");
  const [reportQuery, setReportQuery] = useState("");
  const [reportPage, setReportPage] = useState(0);
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditQuery, setAuditQuery] = useState("");
  const [auditServiceFilter, setAuditServiceFilter] = useState("");
  const [auditPage, setAuditPage] = useState(0);
  const [sessionsAnalytics, setSessionsAnalytics] = useState<AdminSessionsAnalytics | null>(null);
  const [economyAnalytics, setEconomyAnalytics] = useState<AdminEconomyAnalytics | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

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
  }, [refreshNonce]);

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
  }, [refreshNonce]);

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
  }, [refreshNonce]);

  useEffect(() => {
    let cancelled = false;

    async function loadMarketplace() {
      try {
        const data = await getAdminMarketplaceCatalog().catch(() => getCatalog());
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
  }, [refreshNonce]);

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
  }, [userSearchQuery, refreshNonce]);

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
  }, [refreshNonce]);

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      setReportsLoading(true);
      setReportsError(null);
      try {
        const data = await api.getAdminReports({
          status: reportStatusFilter === "all" ? undefined : reportStatusFilter,
          target_type: reportTargetFilter || undefined,
          q: reportQuery || undefined,
          limit: 25,
          offset: reportPage * 25,
        });
        if (!cancelled) {
          setReports(data.items);
          setReportsTotal(data.total);
          setSelectedReportIds([]);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setReportsError(getErrorMessage(err, "Could not load moderation reports."));
        }
      } finally {
        if (!cancelled) {
          setReportsLoading(false);
        }
      }
    }

    loadReports();
    return () => {
      cancelled = true;
    };
  }, [reportStatusFilter, reportTargetFilter, reportQuery, reportPage, refreshNonce]);

  useEffect(() => {
    let cancelled = false;

    async function loadAudit() {
      setAuditLoading(true);
      setAuditError(null);
      try {
        const data = await api.getAdminAudit({
          q: auditQuery || undefined,
          service: auditServiceFilter || undefined,
          limit: 50,
          offset: auditPage * 50,
        });
        if (!cancelled) {
          setAuditEvents(data.items);
          setAuditTotal(data.total);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setAuditError(getErrorMessage(err, "Could not load audit events."));
        }
      } finally {
        if (!cancelled) {
          setAuditLoading(false);
        }
      }
    }

    loadAudit();
    return () => {
      cancelled = true;
    };
  }, [auditQuery, auditServiceFilter, auditPage, refreshNonce]);

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      setAnalyticsError(null);
      try {
        const [sessions, economy] = await Promise.all([
          api.getAdminSessionsAnalytics(),
          getAdminEconomyAnalytics(),
        ]);
        if (!cancelled) {
          setSessionsAnalytics(sessions);
          setEconomyAnalytics(economy);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setAnalyticsError(getErrorMessage(err, "Could not load admin analytics."));
        }
      }
    }

    loadAnalytics();
    return () => {
      cancelled = true;
    };
  }, [refreshNonce]);

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
    alertCount: (
      userResults.filter((user) => user.account_status !== "active").length +
      groups.filter((group) => group.status === "locked").length +
      templates.filter((template) => template.contentStatus === "archived").length +
      starpaths.filter((starpath) => starpath.content_status === "archived").length
    ).toString(),
    capsuleCount: capsules.length,
    liveCapsuleCount: capsules.filter((capsule) => capsule.is_active).length,
    constellationCount: constellations.length,
    activeConstellationCount: constellations.filter((item) => item.is_active).length,
    marketplaceCount: marketplaceItems.length,
  };
  const publicLabCount = templates.filter((template) => template.visibility === "public").length;
  const privateLabCount = templates.filter((template) => template.visibility === "private").length;
  const publicStarpathCount = starpaths.filter(
    (starpath) => String(starpath.visibility).toLowerCase() === "public",
  ).length;
  const privateStarpathCount = starpaths.filter(
    (starpath) => String(starpath.visibility).toLowerCase() === "private",
  ).length;
  const lastRefreshed = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
    [],
  );

  const sections: SectionMeta[] = [
    {
      id: "overview",
      label: "Overview",
      title: "Global control",
      description: "Health, maintenance, and platform summary.",
      icon: <ShieldCheck className="h-4 w-4" />,
      status: "read-only",
    },
    {
      id: "users",
      label: "Users",
      title: "Account search",
      description: "Search accounts, inspect risk, ban, suspend, reactivate, and stop runtimes.",
      icon: <Users className="h-4 w-4" />,
      status: "live",
    },
    {
      id: "moderation",
      label: "Moderation",
      title: "Reports and intervention",
      description: "Review account risk, locked groups, and archived content signals.",
      icon: <Gavel className="h-4 w-4" />,
      status: "live",
    },
    {
      id: "labs",
      label: "Labs",
      title: "Content supervision",
      description: "Review inventory, publish, privatize, archive, restore, and remove labs.",
      icon: <Layers className="h-4 w-4" />,
      status: "live",
    },
    {
      id: "groups",
      label: "Groups",
      title: "All groups",
      description: "Review cohorts, inspect assigned content, lock access, and remove groups.",
      icon: <Users className="h-4 w-4" />,
      status: "live",
    },
    {
      id: "starpaths",
      label: "Starpaths",
      title: "Learning routes",
      description: "Review routes, publish, privatize, archive, restore, and remove starpaths.",
      icon: <Orbit className="h-4 w-4" />,
      status: "live",
    },
    {
      id: "gamification",
      label: "Gamification",
      title: "Economy and collection",
      description: "Tune capsule economy and collection presentation.",
      icon: <Sparkles className="h-4 w-4" />,
      status: "live",
    },
    {
      id: "marketplace",
      label: "Marketplace",
      title: "Catalog operations",
      description: "Inspect catalog inventory, edit pricing, visibility, and ownership impact.",
      icon: <ShoppingCart className="h-4 w-4" />,
      status: "live",
    },
    {
      id: "analytics",
      label: "Analytics",
      title: "Platform signals",
      description: "Track usage, moderation, feedback, and account risk signals.",
      icon: <BarChart3 className="h-4 w-4" />,
      status: "read-only",
    },
    {
      id: "settings",
      label: "Settings",
      title: "Operational tools",
      description: "Operational state, active interventions, and available admin controls.",
      icon: <Wrench className="h-4 w-4" />,
      status: "read-only",
    },
  ];

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
    setConfirmation({
      title: "Delete lab",
      message: `Delete lab "${template.name}" permanently? This removes it from the catalog and cannot be undone from the dashboard.`,
      confirmLabel: "Delete lab",
      tone: "danger",
      onConfirm: async () => {
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
      },
    });
  };

  const handleToggleLabArchive = async (template: AdminTemplate) => {
    const nextStatus = template.contentStatus === "archived" ? "active" : "archived";
    setSavingLabId(template.id);
    setFeedback(null);
    setError(null);

    try {
      const updated = await api.updateAdminLabContentStatus(template.id, nextStatus);
      setTemplates((current) =>
        current.map((entry) => (entry.id === template.id ? normalizeTemplate(updated) : entry)),
      );
      setFeedback(`Lab "${updated.name}" is now ${nextStatus}.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not update lab lifecycle."));
    } finally {
      setSavingLabId(null);
    }
  };

  const handleDeleteGroup = async (group: Group) => {
    setConfirmation({
      title: "Delete group",
      message: `Delete group "${group.name}" permanently? Members will lose this group relationship and assigned access.`,
      confirmLabel: "Delete group",
      tone: "danger",
      onConfirm: async () => {
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
      },
    });
  };

  const loadAdminGroupDetail = async (groupId: string) => {
    setSavingGroupId(groupId);
    setGroupDetailError(null);
    try {
      const detail = await api.getAdminGroupDetail(groupId);
      setSelectedGroupDetail(detail);
    } catch (err: unknown) {
      setGroupDetailError(getErrorMessage(err, "Could not load group detail."));
    } finally {
      setSavingGroupId(null);
    }
  };

  const handleToggleGroupLock = async (group: Group) => {
    const nextStatus = group.status === "locked" ? "active" : "locked";
    setSavingGroupId(group.group_id);
    setFeedback(null);
    setError(null);

    try {
      const updated = await api.updateAdminGroupStatus(group.group_id, nextStatus);
      setGroups((current) =>
        current.map((entry) => (entry.group_id === updated.group_id ? updated : entry)),
      );
      if (selectedGroupDetail?.group.group_id === updated.group_id) {
        setSelectedGroupDetail({ ...selectedGroupDetail, group: updated });
      }
      setFeedback(`Group "${updated.name}" is now ${nextStatus}.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not update group status."));
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
    setConfirmation({
      title: "Delete starpath",
      message: `Delete starpath "${starpath.name}" permanently? Learners will no longer be able to discover or continue this route.`,
      confirmLabel: "Delete starpath",
      tone: "danger",
      onConfirm: async () => {
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
      },
    });
  };

  const handleToggleStarpathArchive = async (starpath: Starpath) => {
    const nextStatus = starpath.content_status === "archived" ? "active" : "archived";
    setSavingStarpathId(starpath.starpath_id);
    setFeedback(null);
    setError(null);

    try {
      const updated = await api.updateAdminStarpathContentStatus(starpath.starpath_id, nextStatus);
      setStarpaths((current) =>
        current.map((entry) => (entry.starpath_id === updated.starpath_id ? updated : entry)),
      );
      setFeedback(`Starpath "${updated.name}" is now ${nextStatus}.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not update starpath lifecycle."));
    } finally {
      setSavingStarpathId(null);
    }
  };

  const handleToggleMarketplaceItem = async (item: MarketplaceItem) => {
    setFeedback(null);
    setError(null);
    try {
      const updated = await updateAdminMarketplaceItem(item.item_code, {
        is_active: !item.is_active,
      });
      setMarketplaceItems((current) =>
        current.map((entry) => (entry.item_code === updated.item_code ? updated : entry)),
      );
      setFeedback(`Marketplace item "${updated.name}" updated.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not update marketplace item."));
    }
  };

  const handleMarketplacePriceChange = async (item: MarketplaceItem) => {
    const raw = window.prompt("New starlight price", String(item.price_starlight));
    if (!raw) {
      return;
    }
    const price = Number(raw);
    if (!Number.isFinite(price) || price < 0) {
      setError("Invalid marketplace price.");
      return;
    }

    setFeedback(null);
    setError(null);
    try {
      const updated = await updateAdminMarketplaceItem(item.item_code, {
        price_starlight: price,
      });
      setMarketplaceItems((current) =>
        current.map((entry) => (entry.item_code === updated.item_code ? updated : entry)),
      );
      setFeedback(`Marketplace item "${updated.name}" price updated.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not update marketplace price."));
    }
  };

  const loadMarketplaceImpact = async (item: MarketplaceItem) => {
    try {
      const impact = await getAdminMarketplaceItemImpact(item.item_code);
      setMarketplaceImpacts((current) => ({
        ...current,
        [item.item_code]: {
          purchases: impact.purchases,
          owners: impact.owners,
        },
      }));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not load marketplace impact."));
    }
  };

  const loadAdminUserDetail = async (userId: string) => {
    setSelectedUserId(userId);
    setSelectedUserLoading(true);
    setSelectedUserError(null);
    setFeedback(null);
    setError(null);

    try {
      const [detail, sessions, labs, userGroups, starpathProgress] = await Promise.all([
        api.getAdminUserDetail(userId),
        api.getSessionsByUser(userId),
        api.getAdminUserDashboardLabs(userId),
        api.getAdminUserGroups(userId),
        api.getAdminUserStarpathProgress(userId),
      ]);

      setSelectedUserDetail(detail);
      setSelectedUserSessions(sessions);
      setSelectedUserLabs(labs);
      setSelectedUserGroups(userGroups);
      setSelectedUserStarpathProgress(starpathProgress);
    } catch (err: unknown) {
      setSelectedUserError(getErrorMessage(err, "Could not load user detail."));
    } finally {
      setSelectedUserLoading(false);
    }
  };

  const applyUserSanction = async () => {
    if (!selectedUserId) {
      return;
    }

    const reason = sanctionReason.trim();
    if (!reason) {
      setSelectedUserError("Reason is required before applying a sanction.");
      return;
    }

    setSavingUserAction(true);
    setSelectedUserError(null);
    setFeedback(null);
    setError(null);

    try {
      await api.createAdminUserSanction(selectedUserId, {
        action: sanctionAction,
        reason,
        duration_days: sanctionAction === "suspend" ? sanctionDurationDays : undefined,
      });
      setSanctionReason("");
      await loadAdminUserDetail(selectedUserId);
      setUserResults((current) =>
        current.map((user) =>
          user.user_id === selectedUserId
            ? {
                ...user,
                account_status:
                  sanctionAction === "ban"
                    ? "banned"
                    : sanctionAction === "suspend"
                      ? "suspended"
                      : user.account_status,
              }
            : user,
        ),
      );
      setFeedback(`Sanction ${sanctionAction} applied.`);
    } catch (err: unknown) {
      setSelectedUserError(getErrorMessage(err, "Could not apply sanction."));
    } finally {
      setSavingUserAction(false);
    }
  };

  const reactivateSelectedUser = async () => {
    if (!selectedUserId) {
      return;
    }

    setSavingUserAction(true);
    setSelectedUserError(null);
    setFeedback(null);
    setError(null);

    try {
      const updated = await api.updateAdminUserAccountStatus(selectedUserId, {
        account_status: "active",
        reason: "Manual admin reactivation",
      });
      await loadAdminUserDetail(selectedUserId);
      setUserResults((current) =>
        current.map((user) => (user.user_id === updated.user_id ? updated : user)),
      );
      setFeedback(`User "${updated.pseudo || updated.email}" reactivated.`);
    } catch (err: unknown) {
      setSelectedUserError(getErrorMessage(err, "Could not reactivate user."));
    } finally {
      setSavingUserAction(false);
    }
  };

  const stopSelectedUserRuntime = async (sessionId: string) => {
    setSavingUserAction(true);
    setSelectedUserError(null);
    setFeedback(null);

    try {
      await api.stopSession(sessionId);
      setSelectedUserSessions((current) =>
        current.map((session) =>
          session.session_id === sessionId
            ? { ...session, current_runtime_id: null, status: session.status ?? "IN_PROGRESS" }
            : session,
        ),
      );
      setFeedback("Runtime stopped.");
    } catch (err: unknown) {
      setSelectedUserError(getErrorMessage(err, "Could not stop runtime."));
    } finally {
      setSavingUserAction(false);
    }
  };

  const refreshAdminWorkspace = () => {
    setFeedback("Refreshing admin workspace...");
    setRefreshNonce((value) => value + 1);
  };

  const runConfirmation = async () => {
    if (!confirmation) {
      return;
    }
    setConfirmBusy(true);
    try {
      await confirmation.onConfirm();
      setConfirmation(null);
      setRefreshNonce((value) => value + 1);
    } finally {
      setConfirmBusy(false);
    }
  };

  const assignReportToMe = async (report: ModerationReport) => {
    setFeedback(null);
    setError(null);
    try {
      const updated = await api.assignAdminReport(report.report_id);
      setReports((current) =>
        current.map((entry) => (entry.report_id === updated.report_id ? updated : entry)),
      );
      setFeedback("Report assigned.");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not assign report."));
    }
  };

  const resolveReport = async (report: ModerationReport, status: ReportStatus) => {
    const resolution = status === "resolved" || status === "dismissed"
      ? window.prompt("Resolution note", report.resolution ?? "")
      : undefined;
    if ((status === "resolved" || status === "dismissed") && resolution === null) {
      return;
    }
    setFeedback(null);
    setError(null);
    try {
      const updated = await api.updateAdminReportStatus(report.report_id, status, resolution || undefined);
      setReports((current) =>
        current.map((entry) => (entry.report_id === updated.report_id ? updated : entry)),
      );
      setFeedback(`Report marked ${status}.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not update report."));
    }
  };

  const bulkResolveReports = async (status: ReportStatus) => {
    if (selectedReportIds.length === 0) {
      setError("Select at least one report first.");
      return;
    }
    setConfirmation({
      title: "Bulk update reports",
      message: `Update ${selectedReportIds.length} selected report(s) to ${status}?`,
      confirmLabel: "Update reports",
      tone: status === "dismissed" ? "warning" : undefined,
      onConfirm: async () => {
        const updated = await api.bulkUpdateAdminReports({
          report_ids: selectedReportIds,
          status,
          resolution: status === "resolved" ? "Bulk resolved by admin" : status === "dismissed" ? "Bulk dismissed by admin" : undefined,
        });
        setReports((current) =>
          current.map((entry) => updated.find((item) => item.report_id === entry.report_id) ?? entry),
        );
        setSelectedReportIds([]);
        setFeedback(`${updated.length} report(s) updated.`);
      },
    });
  };

  const exportAudit = async (format: "json" | "csv") => {
    setFeedback(null);
    setError(null);
    try {
      const data = await api.exportAdminAudit(format);
      const size =
        typeof data === "string"
          ? data.length
          : JSON.stringify(data).length;
      const blob = new Blob([typeof data === "string" ? data : JSON.stringify(data, null, 2)], {
        type: format === "csv" ? "text/csv" : "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `altair-admin-audit.${format}`;
      link.click();
      URL.revokeObjectURL(url);
      setFeedback(`Audit ${format.toUpperCase()} export generated (${size} bytes).`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not export audit."));
    }
  };

  const selectedUserOwnedLabs = selectedUserDetail
    ? templates.filter((lab) => lab.creatorId === selectedUserDetail.user.user_id)
    : [];
  const selectedUserOwnedStarpaths = selectedUserDetail
    ? starpaths.filter((starpath) => starpath.creator_id === selectedUserDetail.user.user_id)
    : [];
  const selectedUserStartedLabs = selectedUserLabs.filter((lab) => lab.status !== "TODO");
  const selectedUserFinishedLabs = selectedUserLabs.filter((lab) => lab.status === "FINISHED");
  const selectedUserInProgressLabs = selectedUserLabs.filter((lab) => lab.status === "IN_PROGRESS");
  const selectedUserTodoLabs = selectedUserLabs.filter((lab) => lab.status === "TODO");
  const selectedUserLatestActivity = [
    ...selectedUserLabs.map((lab) => lab.last_activity_at),
    ...selectedUserSessions.map((session) => session.last_activity_at),
  ]
    .filter(Boolean)
    .sort((a, b) => new Date(String(b)).getTime() - new Date(String(a)).getTime())[0];
  const selectedUserRuntimeSessions = selectedUserSessions.slice(0, 5);
  const selectedUserStaleLab = selectedUserInProgressLabs
    .filter((lab) => {
      const last = new Date(lab.last_activity_at).getTime();
      return Number.isFinite(last) && Date.now() - last > 7 * 24 * 60 * 60 * 1000;
    })
    .sort((a, b) => new Date(a.last_activity_at).getTime() - new Date(b.last_activity_at).getTime())[0];
  const selectedUserCompletedRuntimeMs = selectedUserSessions.reduce((total, session) => {
    if (!session.created_at || !session.completed_at) {
      return total;
    }
    const started = new Date(session.created_at).getTime();
    const completed = new Date(session.completed_at).getTime();
    if (!Number.isFinite(started) || !Number.isFinite(completed) || completed <= started) {
      return total;
    }
    return total + completed - started;
  }, 0);

  const formatDateTime = (value?: string | null) =>
    value ? new Date(value).toLocaleString() : "No activity";

  const formatDuration = (ms: number) => {
    if (ms <= 0) {
      return "n/a";
    }
    const minutes = Math.round(ms / 60000);
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const runtimeIsActive = (session: SessionSummary) => {
    const normalized = String(session.status ?? "").toLowerCase();
    return Boolean(session.current_runtime_id) && ["created", "in_progress"].includes(normalized);
  };

  const adminSignals = {
    blockedUsers: userResults.filter((user) => user.account_status !== "active"),
    suspendedUsers: userResults.filter((user) => user.account_status === "suspended"),
    bannedUsers: userResults.filter((user) => user.account_status === "banned"),
    lockedGroups: groups.filter((group) => group.status === "locked"),
    archivedLabs: templates.filter((template) => template.contentStatus === "archived"),
    archivedStarpaths: starpaths.filter((starpath) => starpath.content_status === "archived"),
    privateLabs: templates.filter((template) => template.visibility === "private"),
    privateStarpaths: starpaths.filter(
      (starpath) => String(starpath.visibility).toLowerCase() === "private",
    ),
    hiddenMarketplaceItems: marketplaceItems.filter((item) => !item.is_active),
    inactiveCapsules: capsules.filter((capsule) => !capsule.is_active),
    inactiveConstellations: constellations.filter((item) => !item.is_active),
    selectedUserActiveRuntimes: selectedUserSessions.filter(runtimeIsActive),
    selectedUserActiveSanctions: selectedUserDetail?.sanctions.filter((item) => item.status === "active") ?? [],
  };

  const moderationQueue = [
    ...adminSignals.bannedUsers.map((user) => ({
      id: `banned-${user.user_id}`,
      title: `Banned account: ${user.pseudo || user.email || user.user_id}`,
      description: user.email || user.user_id,
      extra: "Banned",
      tone: "danger" as const,
    })),
    ...adminSignals.suspendedUsers.map((user) => ({
      id: `suspended-${user.user_id}`,
      title: `Suspended account: ${user.pseudo || user.email || user.user_id}`,
      description: user.email || user.user_id,
      extra: "Suspended",
      tone: "warning" as const,
    })),
    ...adminSignals.lockedGroups.map((group) => ({
      id: `locked-group-${group.group_id}`,
      title: `Locked group: ${group.name}`,
      description: group.description ?? group.group_id,
      extra: "Locked",
      tone: "warning" as const,
    })),
    ...adminSignals.archivedLabs.slice(0, 4).map((lab) => ({
      id: `archived-lab-${lab.id}`,
      title: `Archived lab: ${lab.name}`,
      description: lab.description || lab.id,
      extra: "Archived",
      tone: "neutral" as const,
    })),
    ...adminSignals.archivedStarpaths.slice(0, 4).map((starpath) => ({
      id: `archived-starpath-${starpath.starpath_id}`,
      title: `Archived starpath: ${starpath.name}`,
      description: starpath.description ?? starpath.starpath_id,
      extra: "Archived",
      tone: "neutral" as const,
    })),
  ];

  function renderOverviewPanel() {
    return (
      <div className="space-y-6">
        <PanelTitle
          eyebrow="Global control"
          title="Admin dashboard"
          description="Monitor platform health, content visibility, and admin attention points."
          action={
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/50">
              Last refreshed {lastRefreshed}
            </div>
          }
        />

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
          <KpiCard label="Users" value={summary.userCount} helper="registered accounts" icon={<Users className="h-3.5 w-3.5 text-sky-300" />} />
          <KpiCard label="Labs" value={templatesLoading ? "..." : summary.labCount} helper="public and private labs" icon={<Layers className="h-3.5 w-3.5 text-orange-300" />} />
          <KpiCard label="Groups" value={groupsLoading ? "..." : summary.groupCount} helper="active learning cohorts" icon={<Users className="h-3.5 w-3.5 text-violet-300" />} />
          <KpiCard label="Starpaths" value={starpathsLoading ? "..." : summary.starpathCount} helper="learning routes" icon={<Orbit className="h-3.5 w-3.5 text-emerald-300" />} />
          <KpiCard label="Signals" value={summary.alertCount} helper="admin attention items" icon={<AlertTriangle className="h-3.5 w-3.5 text-rose-300" />} />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <DashboardCard className="p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">Maintenance recap</p>
            </div>
            <div className="mt-4 space-y-3">
              <ListTile title="Platform areas responding" subtitle="Users, labs, groups, starpaths, marketplace, and gamification data loaded." extra="Healthy" />
              <ListTile title="Admin writes available" subtitle="Visibility, removal, and gamification changes are available from this workspace." extra="Ready" />
              <ListTile title="Maintenance watchlist" subtitle="Blocked accounts, locked groups, archived content, and hidden economy items are tracked for review." extra={summary.alertCount} />
            </div>
          </DashboardCard>

          <DashboardCard className="p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">Content visibility</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <MiniCard label="Public labs" value={templatesLoading ? "..." : publicLabCount.toString()} helper="visible content" />
              <MiniCard label="Private labs" value={templatesLoading ? "..." : privateLabCount.toString()} helper="restricted content" />
              <MiniCard label="Public routes" value={starpathsLoading ? "..." : publicStarpathCount.toString()} helper="visible paths" />
              <MiniCard label="Private routes" value={starpathsLoading ? "..." : privateStarpathCount.toString()} helper="restricted paths" />
            </div>
          </DashboardCard>

          <DashboardCard className="p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">Admin attention</p>
            </div>
            <div className="mt-4 space-y-3">
              <ActionTile title="Blocked accounts" description={`${adminSignals.blockedUsers.length} account(s) are currently suspended or banned.`} tone={adminSignals.blockedUsers.length ? "danger" : "neutral"} />
              <ActionTile title="Locked groups" description={`${adminSignals.lockedGroups.length} group(s) currently restrict assigned private access.`} tone={adminSignals.lockedGroups.length ? "warning" : "neutral"} />
              <ActionTile title="Archived content" description={`${adminSignals.archivedLabs.length + adminSignals.archivedStarpaths.length} lab(s) or route(s) are hidden from learner discovery.`} tone={adminSignals.archivedLabs.length + adminSignals.archivedStarpaths.length ? "warning" : "neutral"} />
            </div>
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
          description="Search, inspect, sanction, reactivate, and stop active runtimes. Banned or suspended accounts are blocked by the gateway."
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
                <DashboardCard
                  key={user.user_id}
                  className={[
                    "border p-4 transition",
                    selectedUserId === user.user_id
                      ? "border-sky-400/35 bg-sky-400/10"
                      : "border-white/10 hover:border-white/20 hover:bg-white/[0.06]",
                  ].join(" ")}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {user.pseudo || user.name || user.email || user.user_id}
                      </p>
                      <p className="mt-1 truncate text-xs text-white/45">{user.email}</p>
                      <p className="mt-1 truncate text-[11px] text-white/30">{user.user_id}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-white/55">
                        {user.role}
                      </span>
                      <span
                        className={[
                          "rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em]",
                          user.account_status === "banned"
                            ? "border-rose-400/25 bg-rose-400/10 text-rose-200"
                            : user.account_status === "suspended"
                              ? "border-orange-400/25 bg-orange-400/10 text-orange-200"
                              : "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
                        ].join(" ")}
                      >
                        {user.account_status}
                      </span>
                      <button
                        type="button"
                        onClick={() => loadAdminUserDetail(user.user_id)}
                        className="rounded-xl border border-sky-300/25 bg-sky-400/10 px-3 py-2 text-xs font-semibold text-sky-100 transition hover:bg-sky-400/15"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                </DashboardCard>
              ))
            )}
          </div>
          <DashboardCard className="p-5">
            {!selectedUserId ? (
              <>
                <p className="text-xs uppercase tracking-[0.16em] text-white/35">Account operations</p>
                <div className="mt-4 space-y-3">
	                  <ActionTile title="Select a user" description="Open an admin activity profile with sanctions, audit log, learner progression, linked content, and runtime controls." />
                </div>
              </>
            ) : selectedUserLoading ? (
              <p className="text-sm text-white/45">Loading admin user profile...</p>
            ) : selectedUserError ? (
              <p className="text-sm text-rose-200">{selectedUserError}</p>
            ) : selectedUserDetail ? (
              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-white/35">Admin profile</p>
                  <h3 className="mt-2 truncate text-lg font-semibold text-white">
                    {selectedUserDetail.user.pseudo || selectedUserDetail.user.email}
                  </h3>
                  <p className="mt-1 text-xs text-white/40">{selectedUserDetail.user.user_id}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <MiniCard label="Status" value={selectedUserDetail.user.account_status} helper={selectedUserDetail.user.role} />
                  <MiniCard
                    label="Last activity"
                    value={selectedUserLatestActivity ? new Date(selectedUserLatestActivity).toLocaleDateString() : "None"}
                    helper={selectedUserLatestActivity ? new Date(selectedUserLatestActivity).toLocaleTimeString() : "no signal"}
                  />
                  <MiniCard label="Labs launched" value={selectedUserStartedLabs.length.toString()} helper="started labs" />
                  <MiniCard label="Labs completed" value={selectedUserFinishedLabs.length.toString()} helper="finished labs" />
                  <MiniCard label="In progress" value={selectedUserInProgressLabs.length.toString()} helper="active learning" />
                  <MiniCard label="Runtime time" value={formatDuration(selectedUserCompletedRuntimeMs)} helper="completed sessions" />
                  <MiniCard label="Labs followed" value={selectedUserLabs.length.toString()} helper={`${selectedUserTodoLabs.length} todo`} />
                  <MiniCard
                    label="Labs owned"
                    value={selectedUserOwnedLabs.length.toString()}
                    helper="created content"
                  />
                  <MiniCard label="Groups" value={selectedUserGroups.length.toString()} helper="owned or member" />
                  <MiniCard
                    label="Starpaths followed"
                    value={selectedUserStarpathProgress.length.toString()}
                    helper="progress rows"
                  />
                  <MiniCard
                    label="Starpaths owned"
                    value={selectedUserOwnedStarpaths.length.toString()}
                    helper="created routes"
                  />
                  <MiniCard
                    label="Sanctions"
                    value={selectedUserDetail.sanctions.length.toString()}
                    helper="history"
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-white">Learner progression</p>
                  {selectedUserLabs.slice(0, 4).map((lab) => (
                    <ListTile
                      key={lab.lab_id}
                      title={`${lab.name} · ${lab.progress}%`}
                      subtitle={`${lab.status.toLowerCase()} · last activity ${formatDateTime(lab.last_activity_at)}`}
                      extra={lab.visibility ?? undefined}
                    />
                  ))}
                  {selectedUserLabs.length === 0 ? (
                    <p className="text-sm text-white/40">No followed lab yet.</p>
                  ) : null}
                  {selectedUserStaleLab ? (
                    <ActionTile
                      title="Possible drop-off"
                      description={`${selectedUserStaleLab.name} has been in progress since ${formatDateTime(selectedUserStaleLab.last_activity_at)}.`}
                      tone="warning"
                    />
                  ) : null}
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-white">Linked content</p>
                  <ListTile
                    title={`${selectedUserOwnedLabs.length} owned labs`}
                    subtitle={selectedUserOwnedLabs.slice(0, 2).map((lab) => lab.name).join(", ") || "No created lab."}
                  />
                  <ListTile
                    title={`${selectedUserGroups.length} groups`}
                    subtitle={selectedUserGroups.slice(0, 2).map((group) => group.name).join(", ") || "No group relationship."}
                  />
                  <ListTile
                    title={`${selectedUserStarpathProgress.length} followed starpaths · ${selectedUserOwnedStarpaths.length} owned`}
                    subtitle={selectedUserOwnedStarpaths.slice(0, 2).map((starpath) => starpath.name).join(", ") || "No created starpath."}
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-white">Runtime activity</p>
                  {selectedUserRuntimeSessions.map((session) => {
                    const lab = templates.find((template) => template.id === session.lab_id);
                    return (
                      <div
                        key={session.session_id}
                        className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                              {lab?.name ?? session.lab_id}
                            </p>
                            <p className="mt-1 text-xs text-white/40">{session.session_id}</p>
                            <p className="mt-2 text-xs text-white/45">
                              {session.status ?? "unknown"} · {session.runtime_kind ?? "runtime"} · last {formatDateTime(session.last_activity_at)}
                            </p>
                            <p className="mt-1 text-xs text-white/35">
                              Created {formatDateTime(session.created_at)} · expires {formatDateTime(session.expires_at)}
                            </p>
                          </div>
                          {runtimeIsActive(session) ? (
                            <button
                              type="button"
                              disabled={savingUserAction}
                              onClick={() => stopSelectedUserRuntime(session.session_id)}
                              className="shrink-0 rounded-xl border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Stop
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                  {selectedUserRuntimeSessions.length === 0 ? (
                    <p className="text-sm text-white/40">No runtime session history.</p>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <p className="text-sm font-semibold text-white">Apply sanction</p>
                  <p className="mt-1 text-xs leading-5 text-white/40">
                    Suspend and ban block future API access. Reactivate restores access and resolves active sanctions.
                  </p>
                  <div className="mt-3 grid gap-3">
                    <select
                      value={sanctionAction}
                      onChange={(event) => setSanctionAction(event.target.value as "warn" | "suspend" | "ban")}
                      className={INPUT_CLASSNAME}
                    >
                      <option value="warn">Warn</option>
                      <option value="suspend">Suspend</option>
                      <option value="ban">Ban</option>
                    </select>
                    {sanctionAction === "suspend" ? (
                      <input
                        type="number"
                        min={1}
                        value={sanctionDurationDays}
                        onChange={(event) => setSanctionDurationDays(Number(event.target.value))}
                        className={INPUT_CLASSNAME}
                      />
                    ) : null}
                    <textarea
                      value={sanctionReason}
                      onChange={(event) => setSanctionReason(event.target.value)}
                      placeholder="Reason..."
                      rows={3}
                      className={INPUT_CLASSNAME}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={savingUserAction}
                        onClick={applyUserSanction}
                        className="rounded-xl border border-orange-400/25 bg-orange-400/10 px-3 py-2 text-xs font-semibold text-orange-100 transition hover:bg-orange-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Apply
                      </button>
                      <button
                        type="button"
                        disabled={savingUserAction}
                        onClick={reactivateSelectedUser}
                        className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reactivate access
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-white">Latest sanctions</p>
                  {selectedUserDetail.sanctions.slice(0, 3).map((sanction) => (
                    <ListTile
                      key={sanction.sanction_id}
                      title={`${sanction.action} · ${sanction.status}`}
                      subtitle={sanction.reason}
                      extra={new Date(sanction.created_at).toLocaleDateString()}
                    />
                  ))}
                  {selectedUserDetail.sanctions.length === 0 ? (
                    <p className="text-sm text-white/40">No sanction history.</p>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-white">Audit log</p>
                  {selectedUserDetail.audit_logs.slice(0, 4).map((entry) => (
                    <ListTile
                      key={entry.audit_id}
                      title={humanizeAuditAction(entry.action)}
                      subtitle={formatUserAuditMetadata(entry)}
                      extra={new Date(entry.created_at).toLocaleString()}
                    />
                  ))}
                  {selectedUserDetail.audit_logs.length === 0 ? (
                    <p className="text-sm text-white/40">No audit events yet.</p>
                  ) : null}
                </div>
              </div>
            ) : null}
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
          title="Intervention queue"
          description="Review live admin signals produced by account sanctions, locked groups, and archived content."
        />
        <div className="grid gap-4 xl:grid-cols-4">
          <MiniCard label="Blocked users" value={adminSignals.blockedUsers.length.toString()} helper={`${adminSignals.bannedUsers.length} banned`} />
          <MiniCard label="Suspended" value={adminSignals.suspendedUsers.length.toString()} helper="gateway-blocked" />
          <MiniCard label="Locked groups" value={adminSignals.lockedGroups.length.toString()} helper="access restricted" />
          <MiniCard label="Archived content" value={(adminSignals.archivedLabs.length + adminSignals.archivedStarpaths.length).toString()} helper="hidden from discovery" />
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_380px]">
          <DashboardCard className="p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Reports queue</p>
                <p className="mt-1 text-xs text-white/40">{reportsTotal} report(s) matching filters</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={reportStatusFilter}
                  onChange={(event) => {
                    setReportStatusFilter(event.target.value as ReportStatus | "all");
                    setReportPage(0);
                  }}
                  className={INPUT_CLASSNAME}
                >
                  <option value="all">All</option>
                  <option value="open">Open</option>
                  <option value="in_review">In review</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
                <input
                  value={reportTargetFilter}
                  onChange={(event) => {
                    setReportTargetFilter(event.target.value);
                    setReportPage(0);
                  }}
                  placeholder="target type"
                  className={INPUT_CLASSNAME}
                />
                <input
                  value={reportQuery}
                  onChange={(event) => {
                    setReportQuery(event.target.value);
                    setReportPage(0);
                  }}
                  placeholder="search reports"
                  className={INPUT_CLASSNAME}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => bulkResolveReports("in_review")} className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-xs font-semibold text-sky-200">
                Bulk in review
              </button>
              <button type="button" onClick={() => bulkResolveReports("resolved")} className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200">
                Bulk resolve
              </button>
              <button type="button" onClick={() => bulkResolveReports("dismissed")} className="rounded-xl border border-orange-400/20 bg-orange-400/10 px-3 py-2 text-xs font-semibold text-orange-200">
                Bulk dismiss
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {reportsLoading ? (
                <p className="text-sm text-white/40">Loading reports...</p>
              ) : reportsError ? (
                <p className="text-sm text-rose-200">{reportsError}</p>
              ) : reports.length === 0 ? (
                <p className="text-sm text-white/40">No moderation report found.</p>
              ) : (
                reports.map((report) => (
                  <div key={report.report_id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <label className="flex min-w-0 items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedReportIds.includes(report.report_id)}
                          onChange={(event) =>
                            setSelectedReportIds((current) =>
                              event.target.checked
                                ? [...current, report.report_id]
                                : current.filter((id) => id !== report.report_id),
                            )
                          }
                          className="mt-1"
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-white">
                            {report.target_type} · {report.target_id}
                          </span>
                          <span className="mt-1 block text-sm text-white/45">{report.reason}</span>
                          {report.details ? <span className="mt-1 block text-xs text-white/35">{report.details}</span> : null}
                        </span>
                      </label>
                      <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
                        {report.status} · {report.priority}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => assignReportToMe(report)} className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-xs font-semibold text-sky-200">
                        Assign
                      </button>
                      <button type="button" onClick={() => resolveReport(report, "in_review")} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/70">
                        In review
                      </button>
                      <button type="button" onClick={() => resolveReport(report, "resolved")} className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200">
                        Resolve
                      </button>
                      <button type="button" onClick={() => resolveReport(report, "dismissed")} className="rounded-xl border border-orange-400/20 bg-orange-400/10 px-3 py-2 text-xs font-semibold text-orange-200">
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))
              )}
              {!reportsLoading && reportsTotal > 25 ? (
                <div className="flex items-center justify-between pt-2 text-xs text-white/45">
                  <button type="button" disabled={reportPage === 0} onClick={() => setReportPage((page) => Math.max(0, page - 1))} className="rounded-xl border border-white/10 px-3 py-2 disabled:opacity-40">
                    Previous
                  </button>
                  <span>Page {reportPage + 1}</span>
                  <button type="button" disabled={(reportPage + 1) * 25 >= reportsTotal} onClick={() => setReportPage((page) => page + 1)} className="rounded-xl border border-white/10 px-3 py-2 disabled:opacity-40">
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          </DashboardCard>
          <DashboardCard className="p-5">
            <p className="text-sm font-semibold text-white">Available enforcement</p>
            <div className="mt-4 space-y-3">
              <ActionTile title="Account sanctions" description="Open a user profile to warn, suspend, ban, or reactivate. Suspended and banned accounts are blocked by the gateway." tone={adminSignals.blockedUsers.length ? "danger" : "neutral"} />
              <ActionTile title="Runtime shutdown" description={selectedUserId ? `${adminSignals.selectedUserActiveRuntimes.length} active runtime(s) available on the selected user.` : "Select a user to stop active runtimes."} tone={adminSignals.selectedUserActiveRuntimes.length ? "warning" : "neutral"} />
              <ActionTile title="Content lifecycle" description="Archive, restore, privatize, publish, or delete labs and starpaths from their admin sections." tone={adminSignals.archivedLabs.length + adminSignals.archivedStarpaths.length ? "warning" : "neutral"} />
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
          description="Inspect, publish, privatize, or remove labs from the admin workspace."
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
	                    {template.visibility} · {template.contentStatus}
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
	                    onClick={() => handleToggleLabArchive(template)}
	                    className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-xs font-semibold text-sky-200 transition hover:bg-sky-400/15 disabled:cursor-not-allowed disabled:opacity-50"
	                  >
	                    {template.contentStatus === "archived" ? "Restore" : "Archive"}
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
          description="Inspect all groups, review assigned content, lock private access, or remove groups when admin intervention is needed."
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
	                    {group.status ?? "active"}
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
	                    onClick={() => loadAdminGroupDetail(group.group_id)}
	                    className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-xs font-semibold text-sky-200 transition hover:bg-sky-400/15 disabled:cursor-not-allowed disabled:opacity-50"
	                  >
	                    Inspect
	                  </button>
	                  <button
	                    type="button"
	                    disabled={savingGroupId === group.group_id}
	                    onClick={() => handleToggleGroupLock(group)}
	                    className="rounded-xl border border-orange-400/20 bg-orange-400/10 px-3 py-2 text-xs font-semibold text-orange-200 transition hover:bg-orange-400/15 disabled:cursor-not-allowed disabled:opacity-50"
	                  >
	                    {group.status === "locked" ? "Unlock" : "Lock"}
	                  </button>
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
	        <DashboardCard className="p-5">
	          <p className="text-sm font-semibold text-white">Group operations</p>
	          {groupDetailError ? <p className="mt-3 text-sm text-rose-200">{groupDetailError}</p> : null}
	          {selectedGroupDetail ? (
	            <div className="mt-4 grid gap-3 md:grid-cols-4">
	              <MiniCard label="Members" value={selectedGroupDetail.members.length.toString()} helper={selectedGroupDetail.group.status ?? "active"} />
	              <MiniCard label="Labs" value={selectedGroupDetail.labs.length.toString()} helper="assigned" />
	              <MiniCard label="Starpaths" value={selectedGroupDetail.starpaths.length.toString()} helper="assigned" />
	              <MiniCard label="Owner" value={selectedGroupDetail.group.creator_id.slice(0, 8)} helper="creator id" />
	            </div>
	          ) : null}
	          <div className="mt-4 grid gap-3 md:grid-cols-2">
	            <ActionTile title="Member drill-down" description="Inspect roles and membership counts by group." />
	            <ActionTile title="Assigned content" description="Review labs and starpaths currently attached to each group." />
	            <ActionTile title="Lock lifecycle" description="Locked groups no longer grant access to assigned private labs or starpaths." tone="warning" />
	          </div>
        </DashboardCard>
      </div>
    );
  }

  function renderStarpathsPanel() {
    return (
      <div className="space-y-6">
        <PanelTitle
          eyebrow="Starpaths"
          title="Starpath management"
          description="Inspect, publish, privatize, or remove learning routes from the admin workspace."
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
	                      {visibility} · {starpath.content_status ?? "active"}
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
	                      onClick={() => handleToggleStarpathArchive(starpath)}
	                      className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-xs font-semibold text-sky-200 transition hover:bg-sky-400/15 disabled:cursor-not-allowed disabled:opacity-50"
	                    >
	                      {starpath.content_status === "archived" ? "Restore" : "Archive"}
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
        <DashboardCard className="p-5">
          <p className="text-sm font-semibold text-white">Route health</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <ActionTile title="Public routes" description={`${publicStarpathCount} route(s) are visible to learners.`} />
            <ActionTile title="Private routes" description={`${privateStarpathCount} route(s) require ownership or group access.`} />
            <ActionTile title="Archived routes" description={`${adminSignals.archivedStarpaths.length} route(s) are removed from learner discovery without deleting history.`} tone={adminSignals.archivedStarpaths.length ? "warning" : "neutral"} />
            <ActionTile title="Private access audit" description={`${adminSignals.lockedGroups.length} locked group(s) currently reduce assigned private access.`} tone={adminSignals.lockedGroups.length ? "warning" : "neutral"} />
          </div>
        </DashboardCard>
      </div>
    );
  }

  function renderGamificationPanel() {
    return (
      <div className="space-y-6">
        <PanelTitle
          eyebrow="Gamification"
          title="Control room"
          description="Manage capsule economy, constellation metadata, and collection-facing content."
          action={
            <div className="flex flex-wrap gap-2">
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
                className="rounded-2xl border border-sky-300/25 bg-sky-400/10 px-4 py-2.5 text-sm font-semibold text-sky-100 transition hover:border-sky-200/40 hover:bg-sky-400/16"
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
                description="Adjust pricing, drop rates, pity thresholds, and activation state."
                action={
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white/45">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-sky-300" />
                    Economy controls
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
                            className={GAMIFICATION_INPUT_CLASSNAME}
                          />
                        </label>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <div className="text-xs text-white/35">Changes apply to future capsule openings.</div>
                      <button
                        type="button"
                        onClick={() => saveCapsule(capsule)}
                        disabled={savingCapsule === capsule.capsule_type}
                        className={GAMIFICATION_PRIMARY_BUTTON_CLASSNAME}
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
                            {item.is_active ? "Published" : "Hidden"}
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
                        description="Manage gacha, collection, editorial, and source content."
                      />

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-1.5 text-sm text-white/60">
                          <span>Name</span>
                          <input
                            value={selectedConstellation.name}
                            onChange={(e) =>
                              updateConstellationField(selectedConstellation.item_code, "name", e.target.value)
                            }
                            className={GAMIFICATION_INPUT_CLASSNAME}
                          />
                        </label>
                        <label className="space-y-1.5 text-sm text-white/60">
                          <span>Rarity</span>
                          <select
                            value={selectedConstellation.rarity}
                            onChange={(e) =>
                              updateConstellationField(selectedConstellation.item_code, "rarity", e.target.value)
                            }
                            className={GAMIFICATION_INPUT_CLASSNAME}
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
                            className={GAMIFICATION_INPUT_CLASSNAME}
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
                            className={GAMIFICATION_INPUT_CLASSNAME}
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
                          className={GAMIFICATION_INPUT_CLASSNAME}
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
                          className={GAMIFICATION_INPUT_CLASSNAME}
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
                          className={GAMIFICATION_INPUT_CLASSNAME}
                        />
                      </label>

                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs text-white/35">Changes update collection and gacha presentation.</div>
                        <button
                          type="button"
                          onClick={() => saveConstellation(selectedConstellation)}
                          disabled={savingConstellation === selectedConstellation.item_code}
                          className={GAMIFICATION_PRIMARY_BUTTON_CLASSNAME}
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
          title="Catalog operations"
          description="Inspect catalog inventory, edit pricing, toggle visibility, and review ownership impact."
        />
        <div className="grid gap-4 xl:grid-cols-3">
          <MiniCard
            label="Catalog items"
            value={marketplaceLoading ? "..." : marketplaceItems.length.toString()}
            helper="available items"
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
          <MiniCard label="Hidden items" value={adminSignals.hiddenMarketplaceItems.length.toString()} helper="not purchasable" />
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
	                    {item.price_starlight} starlight · {item.is_active ? "visible" : "hidden"}
	                  </div>
	                </div>
	                <div className="mt-4 flex flex-wrap gap-2">
	                  <button
	                    type="button"
	                    onClick={() => handleMarketplacePriceChange(item)}
	                    className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-xs font-semibold text-sky-200 transition hover:bg-sky-400/15"
	                  >
	                    Price
	                  </button>
	                  <button
	                    type="button"
	                    onClick={() => handleToggleMarketplaceItem(item)}
	                    className="rounded-xl border border-orange-400/20 bg-orange-400/10 px-3 py-2 text-xs font-semibold text-orange-200 transition hover:bg-orange-400/15"
	                  >
	                    {item.is_active ? "Hide" : "Show"}
	                  </button>
	                  <button
	                    type="button"
	                    onClick={() => loadMarketplaceImpact(item)}
	                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/[0.07]"
	                  >
	                    Impact
	                  </button>
	                </div>
	                {marketplaceImpacts[item.item_code] ? (
	                  <div className="mt-4 grid grid-cols-2 gap-3">
	                    <MiniCard
	                      label="Purchases"
	                      value={marketplaceImpacts[item.item_code].purchases.toString()}
	                      helper="buy requests"
	                    />
	                    <MiniCard
	                      label="Owners"
	                      value={marketplaceImpacts[item.item_code].owners.toString()}
	                      helper="current cosmetics"
	                    />
	                  </div>
	                ) : null}
	              </DashboardCard>
            ))}
          </div>
        )}
        <DashboardCard className="p-5">
          <p className="text-sm font-semibold text-white">Marketplace operations</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <ActionTile title="Price adjustments" description="Review currency balance before applying catalog price changes." />
            <ActionTile title="Visibility controls" description="Hide seasonal or retired items without affecting owned cosmetics." />
            <ActionTile title="Manifest and assets" description="Inspect item metadata, preview copy, and visual assets." />
            <ActionTile title="Ownership impact" description="Audit purchases and existing possessions before major catalog changes." tone="warning" />
          </div>
        </DashboardCard>
      </div>
    );
  }

  function renderAnalyticsPanel() {
    return (
      <div className="space-y-6">
        <PanelTitle
          eyebrow="Analytics"
          title="Available signals"
          description="Monitor platform usage, content engagement, moderation load, and account risk."
        />
        <div className="grid gap-4 xl:grid-cols-4">
          <MiniCard label="Launches" value={sessionsAnalytics ? sessionsAnalytics.launched_sessions.toString() : "..."} helper={`${sessionsAnalytics?.launches_last_7d ?? 0} last 7d`} />
          <MiniCard label="Completions" value={sessionsAnalytics ? sessionsAnalytics.completed_sessions.toString() : "..."} helper={`${sessionsAnalytics?.completions_last_7d ?? 0} last 7d`} />
          <MiniCard label="Active sessions" value={sessionsAnalytics ? sessionsAnalytics.active_sessions.toString() : "..."} helper={`${sessionsAnalytics?.active_runtimes ?? 0} runtimes`} />
          <MiniCard label="Gacha rolls" value={economyAnalytics ? economyAnalytics.total_gacha_rolls.toString() : "..."} helper={`${economyAnalytics?.gacha_rolls_last_7d ?? 0} last 7d`} />
        </div>
        {analyticsError ? <StatusBanner tone="error">{analyticsError}</StatusBanner> : null}
        <div className="grid gap-4 xl:grid-cols-2">
          <DashboardCard className="p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">Economy signals</p>
            <div className="mt-4 space-y-3">
              <ListTile title={`${economyAnalytics?.active_capsules ?? summary.liveCapsuleCount} active capsules`} subtitle={`${economyAnalytics?.inactive_capsules ?? adminSignals.inactiveCapsules.length} inactive capsules.`} />
              <ListTile title={`${economyAnalytics?.starlight_spent_gacha ?? 0} starlight spent in gacha`} subtitle={`${economyAnalytics?.total_gacha_rolls ?? 0} total gacha rolls.`} />
              <ListTile title={`${economyAnalytics?.marketplace_purchases ?? 0} marketplace purchases`} subtitle={`${economyAnalytics?.marketplace_owners ?? 0} unique cosmetic owners.`} />
              <ListTile title={`${economyAnalytics?.net_currency_ledger_amount ?? 0} net ledger amount`} subtitle={`${economyAnalytics?.currency_ledger_entries ?? 0} currency ledger entries.`} />
            </div>
          </DashboardCard>
          <DashboardCard className="p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">Risk signals</p>
            <div className="mt-4 space-y-3">
              <ActionTile title="Blocked accounts" description={`${adminSignals.blockedUsers.length} suspended or banned account(s) in the loaded user set.`} tone={adminSignals.blockedUsers.length ? "danger" : "neutral"} />
              <ActionTile title="Content lifecycle" description={`${adminSignals.archivedLabs.length} archived lab(s) and ${adminSignals.archivedStarpaths.length} archived route(s).`} tone={adminSignals.archivedLabs.length + adminSignals.archivedStarpaths.length ? "warning" : "neutral"} />
              <ActionTile title="Private inventory" description={`${adminSignals.privateLabs.length} private lab(s) and ${adminSignals.privateStarpaths.length} private route(s).`} />
              <ActionTile title="Economy visibility" description={`${adminSignals.hiddenMarketplaceItems.length} hidden marketplace item(s), ${adminSignals.inactiveCapsules.length} inactive capsule(s), ${adminSignals.inactiveConstellations.length} hidden constellation(s).`} tone={adminSignals.hiddenMarketplaceItems.length + adminSignals.inactiveCapsules.length + adminSignals.inactiveConstellations.length ? "warning" : "neutral"} />
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
          description="Current operational state and the admin sections that perform each live action."
        />
        <div className="grid gap-4 xl:grid-cols-2">
          <DashboardCard className="p-5">
            <p className="text-sm font-semibold text-white">Operational controls</p>
            <div className="mt-4 space-y-3">
              <ListTile title="Account enforcement" subtitle="Warnings, suspensions, bans, and reactivation write to users-ms and affect gateway access." extra={`${adminSignals.blockedUsers.length} blocked`} />
              <ListTile title="Runtime cleanup" subtitle="Active selected-user runtimes can be stopped through sessions-ms." extra={`${adminSignals.selectedUserActiveRuntimes.length} active`} />
              <ListTile title="Content maintenance" subtitle="Lab and starpath visibility/archive/delete actions write to their source services." extra={`${adminSignals.archivedLabs.length + adminSignals.archivedStarpaths.length} archived`} />
            </div>
          </DashboardCard>
          <DashboardCard className="p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">Global audit</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => exportAudit("json")} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/70">
                  JSON
                </button>
                <button type="button" onClick={() => exportAudit("csv")} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/70">
                  CSV
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                value={auditQuery}
                onChange={(event) => {
                  setAuditQuery(event.target.value);
                  setAuditPage(0);
                }}
                placeholder="Search audit action/path"
                className={INPUT_CLASSNAME}
              />
              <input
                value={auditServiceFilter}
                onChange={(event) => {
                  setAuditServiceFilter(event.target.value);
                  setAuditPage(0);
                }}
                placeholder="Service filter"
                className={INPUT_CLASSNAME}
              />
            </div>
            <div className="mt-4 space-y-3">
              {auditLoading ? (
                <p className="text-sm text-white/40">Loading audit events...</p>
              ) : auditError ? (
                <p className="text-sm text-rose-200">{auditError}</p>
              ) : auditEvents.length === 0 ? (
                <p className="text-sm text-white/40">No audit event found.</p>
              ) : (
                auditEvents.slice(0, 8).map((entry) => (
                  <ListTile
                    key={entry.audit_id}
                    title={humanizeAuditAction(entry.action)}
                    subtitle={`${entry.service ?? "unknown"} · ${entry.http_method ?? ""} ${entry.http_path ?? ""}`}
                    extra={entry.status_code ? String(entry.status_code) : new Date(entry.created_at).toLocaleDateString()}
                  />
                ))
              )}
              {!auditLoading && auditTotal > 50 ? (
                <div className="flex items-center justify-between pt-2 text-xs text-white/45">
                  <button type="button" disabled={auditPage === 0} onClick={() => setAuditPage((page) => Math.max(0, page - 1))} className="rounded-xl border border-white/10 px-3 py-2 disabled:opacity-40">
                    Previous
                  </button>
                  <span>Page {auditPage + 1}</span>
                  <button type="button" disabled={(auditPage + 1) * 50 >= auditTotal} onClick={() => setAuditPage((page) => page + 1)} className="rounded-xl border border-white/10 px-3 py-2 disabled:opacity-40">
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          </DashboardCard>
          <DashboardCard className="p-5 xl:col-span-2">
            <p className="text-sm font-semibold text-white">Security actions</p>
            <div className="mt-4 space-y-3">
              <ActionTile title="Suspend or ban" description="Use Users to apply sanctions with a reason. Suspensions can expire; bans remain until reactivation." tone="warning" />
              <ActionTile title="Revoke active sessions" description={selectedUserId ? `Use the selected user profile to stop ${adminSignals.selectedUserActiveRuntimes.length} active runtime(s).` : "Select a user to reveal runtime shutdown controls."} tone={adminSignals.selectedUserActiveRuntimes.length ? "danger" : "neutral"} />
              <ActionTile title="Audit trail" description={selectedUserId ? `${adminSignals.selectedUserActiveSanctions.length} active sanction(s) and ${selectedUserDetail?.audit_logs.length ?? 0} audit event(s) loaded for the selected user.` : "Select a user to inspect sanctions and audit events from users-ms."} />
            </div>
          </DashboardCard>
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
              Monitor users, content, groups, economy, and operational signals from one workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={refreshAdminWorkspace}
              className="inline-flex items-center gap-2 rounded-2xl border border-sky-300/20 bg-sky-400/10 px-3 py-2 text-xs font-medium text-sky-100 transition hover:border-sky-200/35 hover:bg-sky-400/15"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
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
              {renderActivePanel()}
            </div>
          </DashboardCard>
        </div>
      </div>
      {confirmation ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111827] p-5 shadow-2xl">
            <p className="text-lg font-semibold text-white">{confirmation.title}</p>
            <p className="mt-3 text-sm leading-6 text-white/55">{confirmation.message}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={confirmBusy}
                onClick={() => setConfirmation(null)}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/70 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmBusy}
                onClick={runConfirmation}
                className={[
                  "rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-50",
                  confirmation.tone === "danger"
                    ? "border-rose-400/30 bg-rose-400/15 text-rose-100"
                    : "border-orange-400/30 bg-orange-400/15 text-orange-100",
                ].join(" ")}
              >
                {confirmBusy ? "Working..." : confirmation.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
