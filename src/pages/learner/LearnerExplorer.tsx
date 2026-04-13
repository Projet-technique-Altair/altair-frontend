// src/pages/learner/LearnerExplorer.tsx

/**
 * @file LearnerExplorer — discovery page for new labs and starpaths.
 *
 * @remarks
 * This page allows learners to explore newly released Labs and Starpaths.
 * It provides:
 *  - A global search bar for filtering items by name
 *  - Two responsive sections:
 *      1. New Labs
 *      2. New Starpaths
 *
 * Route: `/learner/explorer`
 *
 * @packageDocumentation
 */

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Rocket, Search, Star } from "lucide-react";

import { getLabs } from "@/api/labs";
import { getStarpaths } from "@/api/starpaths";
import {
  followLab,
  getLearnerDashboardLabs,
  type LearnerDashboardLab,
  type LearnerLabStatus,
  unfollowLab,
} from "@/api/sessions";

import type { Lab } from "@/contracts/labs";
import type { Starpath } from "@/contracts/starpaths";

/* ================= TYPES ================= */

type ExplorerLab = {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Unknown";
  domain: string;
  rating: number;
  participants: number;
  learnerStatus: LearnerLabStatus | null;
};

type ExplorerStarpath = {
  id: string;
  name: string;
  domain: string;
  chaptersCompleted: number;
  totalChapters: number;
  labs: number;
  rating: number;
  participants: number;
};

/* ================= MAPPERS ================= */

function mapLabToExplorer(lab: Lab): ExplorerLab {
  return {
    id: lab.lab_id,
    name: lab.name,
    level:
      lab.difficulty === "EASY"
        ? "Beginner"
        : lab.difficulty === "MEDIUM"
        ? "Intermediate"
        : lab.difficulty === "HARD"
        ? "Advanced"
        : "Unknown",
    domain: lab.category ?? "General",
    rating: 0,
    participants: 0,
    learnerStatus: null,
  };
}

function mapStarpathToExplorer(sp: Starpath): ExplorerStarpath {
  return {
    id: sp.starpath_id,
    name: sp.name,
    domain: sp.difficulty ?? "General",
    chaptersCompleted: 0,
    totalChapters: 0,
    labs: 0,
    rating: 0,
    participants: 0,
  };
}

/* ================= HELPERS ================= */

function getLevelClasses(level: ExplorerLab["level"]) {
  if (level === "Beginner") {
    return "bg-green-500/12 text-green-300 border border-green-400/20";
  }

  if (level === "Intermediate") {
    return "bg-yellow-500/12 text-yellow-300 border border-yellow-400/20";
  }

  if (level === "Advanced") {
    return "bg-red-500/12 text-red-300 border border-red-400/20";
  }

  return "bg-white/8 text-white/65 border border-white/10";
}

function renderLearnerMarker(status: LearnerLabStatus | null) {
  if (status === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/25 bg-sky-500/15 px-2 py-1 text-[10px] font-semibold text-sky-300">
        <Rocket className="h-3.5 w-3.5" />
        IN PROGRESS
      </span>
    );
  }

  if (status === "FINISHED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-400/25 bg-green-500/15 px-2 py-1 text-[10px] font-semibold text-green-300">
        <CheckCircle2 className="h-3.5 w-3.5" />
        FINISHED
      </span>
    );
  }

  return null;
}

/* ================= COMPONENT ================= */

export default function LearnerExplorer() {
  const [query, setQuery] = useState("");
  const [labs, setLabs] = useState<ExplorerLab[]>([]);
  const [starpaths, setStarpaths] = useState<ExplorerStarpath[]>([]);
  const [pendingLabId, setPendingLabId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [labsData, starpathsData, learnerLabsData] = await Promise.all([
          getLabs(),
          getStarpaths(),
          getLearnerDashboardLabs(),
        ]);

        const learnerStatusByLabId = new Map<string, LearnerLabStatus>();
        (learnerLabsData as LearnerDashboardLab[]).forEach((lab) => {
          learnerStatusByLabId.set(lab.lab_id, lab.status);
        });

        const publicLabs = (labsData as Lab[]).filter(
          (lab) => lab.visibility === "PUBLIC"
        );

        const publicStarpaths = (starpathsData as Starpath[]).filter(
          (sp) => sp.visibility === "PUBLIC"
        );

        setLabs(
          publicLabs.map((lab) => ({
            ...mapLabToExplorer(lab),
            learnerStatus: learnerStatusByLabId.get(lab.lab_id) ?? null,
          }))
        );

        setStarpaths(publicStarpaths.map(mapStarpathToExplorer));
      } catch (err) {
        console.error(err);
        setLoadError("Failed to load explorer");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const filteredLabs = useMemo(
    () =>
      labs.filter((lab) =>
        lab.name.toLowerCase().includes(query.toLowerCase())
      ),
    [labs, query]
  );

  const filteredStarpaths = useMemo(
    () =>
      starpaths.filter((sp) =>
        sp.name.toLowerCase().includes(query.toLowerCase())
      ),
    [starpaths, query]
  );

  async function handleToggleFollow(
    labId: string,
    currentStatus: LearnerLabStatus | null
  ) {
    if (currentStatus === "IN_PROGRESS" || currentStatus === "FINISHED") {
      return;
    }

    setPendingLabId(labId);
    setActionError(null);

    try {
      if (currentStatus === "TODO") {
        await unfollowLab(labId);
      } else {
        await followLab(labId);
      }

      setLabs((prev) =>
        prev.map((lab) =>
          lab.id === labId
            ? {
                ...lab,
                learnerStatus: currentStatus === "TODO" ? null : "TODO",
              }
            : lab
        )
      );
    } catch (err) {
      console.error(err);
      setActionError("Failed to update followed lab state");
    } finally {
      setPendingLabId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white/75">
        Loading explorer…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        {loadError}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-6 py-10 text-white xl:px-10 2xl:px-14">
      <div className="mx-auto w-full max-w-[1720px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">
              Explorer
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white/92">
              Explore labs and starpaths
            </h1>
            <p className="mt-2 text-sm text-white/55">
              Discover new content, resume what matters, and follow future paths.
            </p>
          </div>

          <div className="w-full lg:w-[360px] xl:w-[390px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search..."
                className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-white/90 outline-none backdrop-blur-md transition placeholder:text-white/35 focus:border-white/20"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 h-px w-full bg-white/10" />

        {actionError ? (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {actionError}
          </div>
        ) : null}

        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white/90">New Labs</h2>
              <p className="mt-1 text-sm text-white/50">
                Public labs available to explore now.
              </p>
            </div>

            <div className="text-xs text-white/45">
              {filteredLabs.length} visible
            </div>
          </div>

          {filteredLabs.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/15 px-5 py-6 text-sm text-white/55 backdrop-blur-sm">
              No labs match your current search.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
              {filteredLabs.map((lab) => (
                <button
                  key={lab.id}
                  type="button"
                  onClick={() => navigate(`/learner/labs/${lab.id}`)}
                  className="group rounded-2xl border border-white/10 bg-black/20 p-5 text-left backdrop-blur-md transition hover:border-white/20 hover:bg-white/[0.07]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-white/92">
                        {lab.name}
                      </h3>
                      <p className="mt-1 text-sm text-white/50">{lab.domain}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {renderLearnerMarker(lab.learnerStatus)}
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getLevelClasses(
                          lab.level
                        )}`}
                      >
                        {lab.level}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4 text-sm text-white/55">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>{lab.rating.toFixed(1)}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span>{lab.participants} learners</span>

                      {(lab.learnerStatus === null ||
                        lab.learnerStatus === "TODO") && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleToggleFollow(lab.id, lab.learnerStatus);
                          }}
                          disabled={pendingLabId === lab.id}
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                            lab.learnerStatus === "TODO"
                              ? "border-orange-300/25 bg-orange-500/15 text-orange-200"
                              : "border-white/15 bg-white/5 text-white/75 hover:bg-white/10"
                          } ${
                            pendingLabId === lab.id
                              ? "cursor-not-allowed opacity-60"
                              : ""
                          }`}
                        >
                          {pendingLabId === lab.id
                            ? "..."
                            : lab.learnerStatus === "TODO"
                            ? "Following"
                            : "Follow"}
                        </button>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white/90">
                New Starpaths
              </h2>
              <p className="mt-1 text-sm text-white/50">
                Structured paths to guide longer progression.
              </p>
            </div>

            <div className="text-xs text-white/45">
              {filteredStarpaths.length} visible
            </div>
          </div>

          {filteredStarpaths.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/15 px-5 py-6 text-sm text-white/55 backdrop-blur-sm">
              No starpaths match your current search.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
              {filteredStarpaths.map((sp) => (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => navigate(`/learner/starpaths/${sp.id}`)}
                  className="group rounded-2xl border border-white/10 bg-black/20 p-5 text-left backdrop-blur-md transition hover:border-white/20 hover:bg-white/[0.07]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-white/92">
                        {sp.name}
                      </h3>
                      <p className="mt-1 text-sm text-white/50">{sp.domain}</p>
                    </div>

                    <div className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white/60">
                      Starpath
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4 text-sm text-white/55">
                    <span>
                      {sp.chaptersCompleted}/{sp.totalChapters} chapters •{" "}
                      {sp.labs} labs
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>{sp.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-white/45">
                    {sp.participants} learners following
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}