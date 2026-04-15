import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Globe,
  Loader2,
  Lock,
  Orbit,
  Save,
  Sparkles,
} from "lucide-react";

import { createStarpath } from "@/api/starpaths";

type StarpathDifficulty = "beginner" | "intermediate" | "advanced";
type StarpathVisibility = "PRIVATE" | "PUBLIC";

type CreateStarpathForm = {
  name: string;
  description: string;
  difficulty: StarpathDifficulty;
  visibility: StarpathVisibility;
};

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-white/58">
      <span>{children}</span>
      {required && <span className="text-[10px] text-sky-300/80">Required</span>}
    </label>
  );
}

function FieldHint({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-xs leading-relaxed text-white/46">{children}</p>;
}

function InputShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-black/20 p-4 transition focus-within:border-sky-400/40 focus-within:bg-white/[0.055] focus-within:shadow-[0_0_0_1px_rgba(56,189,248,0.16)] ${className}`}
    >
      {children}
    </div>
  );
}

function SummaryPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Orbit;
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

function SelectCard({
  active,
  title,
  description,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  icon: typeof Globe;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? "border-sky-400/40 bg-white/[0.06] shadow-[0_0_30px_rgba(56,189,248,0.08)]"
          : "border-white/10 bg-black/20 hover:border-white/15 hover:bg-white/[0.04]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 rounded-xl border p-2 ${
            active
              ? "border-sky-400/30 bg-sky-400/10 text-sky-200"
              : "border-white/10 bg-white/[0.03] text-white/62"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <div className="text-sm font-semibold text-white/88">{title}</div>
          <div className="mt-1 text-xs leading-relaxed text-white/50">
            {description}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function CreateStarpathPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateStarpathForm>({
    name: "",
    description: "",
    difficulty: "beginner",
    visibility: "PRIVATE",
  });

  const [creating, setCreating] = useState(false);
  const [createStage, setCreateStage] = useState<
    "idle" | "validating" | "creating" | "success"
  >("idle");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const normalizedName = form.name.replace(/\s+/g, " ").trim();
  const normalizedDescription = form.description.trim();

  const completion = useMemo(() => {
    let filled = 0;
    const total = 2;

    if (normalizedName) filled += 1;
    if (normalizedDescription) filled += 1;

    return Math.round((filled / total) * 100);
  }, [normalizedDescription, normalizedName]);

  const stageLabel =
    createStage === "validating"
      ? "Validating starpath"
      : createStage === "creating"
        ? "Creating starpath"
        : createStage === "success"
          ? "Starpath created"
          : "Ready";

  const handleChange = <K extends keyof CreateStarpathForm>(
    field: K,
    value: CreateStarpathForm[K],
  ) => {
    setMessage(null);
    setCreateStage("idle");
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreate = async () => {
    if (creating) return;

    setCreating(true);
    setCreateStage("validating");
    setMessage(null);

    try {
      if (!normalizedName) {
        throw new Error("Starpath name cannot be empty.");
      }

      setCreateStage("creating");

      const starpath = await createStarpath({
        name: normalizedName,
        description: normalizedDescription,
        difficulty: form.difficulty,
        visibility: form.visibility,
      });

      setCreateStage("success");
      setMessage({
        type: "success",
        text: "Starpath created successfully. Redirecting to the details page.",
      });

      window.setTimeout(() => {
        navigate(`/creator/starpath/${starpath.starpath_id}`, { replace: true });
      }, 700);
    } catch (error) {
      console.error("Failed to create starpath:", error);

      setCreateStage("idle");
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to create starpath.",
      });
    } finally {
      setCreating(false);
    }
  };

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
            Creator starpath
          </div>

          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white/92 sm:text-4xl">
                Create starpath
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
                Create a structured learning path composed of multiple labs and publish it with the right visibility.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <SummaryPill icon={Orbit} label="Labs" value="0 at creation" />
              <SummaryPill icon={Sparkles} label="Difficulty" value={form.difficulty} />
              <SummaryPill icon={CheckCircle2} label="Completion" value={`${completion}%`} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleCreate}
              disabled={creating}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-sky-400/40 hover:bg-white/5 hover:shadow-[0_0_40px_rgba(56,189,248,0.25)] active:scale-[0.98] ${
                creating ? "cursor-not-allowed opacity-70" : ""
              }`}
              type="button"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{stageLabel}…</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Create starpath</span>
                </>
              )}
            </button>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/62">
              {createStage === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              ) : creating ? (
                <Loader2 className="h-4 w-4 animate-spin text-sky-300" />
              ) : (
                <CircleAlert className="h-4 w-4 text-white/45" />
              )}
              <span>{stageLabel}</span>
            </div>
          </div>

          {(creating || createStage === "success") && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
              <div
                className={`h-1.5 transition-all duration-500 ${
                  createStage === "validating"
                    ? "w-[30%] bg-sky-400/70"
                    : createStage === "creating"
                      ? "w-[82%] bg-sky-400/70"
                      : "w-full bg-emerald-400/70"
                }`}
              />
              <div className="px-4 py-3 text-sm text-white/68">
                {createStage === "validating" &&
                  "Checking required fields and preparing the starpath payload."}
                {createStage === "creating" &&
                  "Creating the starpath and preparing the management page."}
                {createStage === "success" &&
                  "The starpath has been created successfully. Redirecting to the details page."}
              </div>
            </div>
          )}

          {message && (
            <div
              className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
                message.type === "success"
                  ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                  : "border-red-400/20 bg-red-500/10 text-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="mt-6 h-px w-full bg-white/10" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-white/50">
                    Starpath content
                  </div>
                  <div className="mt-2 text-sm text-white/62">
                    Start with the identity and framing of the learning path.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/55">
                  {completion}% complete
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <InputShell>
                  <FieldLabel required>Name</FieldLabel>
                  <input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                    placeholder="Starpath name"
                  />
                  <FieldHint>
                    Use a short and recognizable name for this learning path.
                  </FieldHint>
                </InputShell>

                <InputShell>
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={5}
                    className="mt-3 w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-white/82 outline-none placeholder:text-white/28"
                    placeholder="Describe the purpose and learning path of this starpath"
                  />
                  <FieldHint>
                    Explain the objective, progression, or audience of the starpath.
                  </FieldHint>
                </InputShell>
              </div>
            </div>
          </div>

          <div className="space-y-6 xl:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md xl:sticky xl:top-6">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Configuration
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <FieldLabel>Difficulty</FieldLabel>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    <SelectCard
                      active={form.difficulty === "beginner"}
                      icon={Sparkles}
                      title="Beginner"
                      description="Introductory path with gentle progression."
                      onClick={() => handleChange("difficulty", "beginner")}
                    />
                    <SelectCard
                      active={form.difficulty === "intermediate"}
                      icon={Sparkles}
                      title="Intermediate"
                      description="Path with more autonomy and denser learning steps."
                      onClick={() => handleChange("difficulty", "intermediate")}
                    />
                    <SelectCard
                      active={form.difficulty === "advanced"}
                      icon={Sparkles}
                      title="Advanced"
                      description="Demanding path designed for stronger autonomy."
                      onClick={() => handleChange("difficulty", "advanced")}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Visibility</FieldLabel>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    <SelectCard
                      active={form.visibility === "PRIVATE"}
                      icon={Lock}
                      title="Private"
                      description="Visible only in controlled creator or assigned flows."
                      onClick={() => handleChange("visibility", "PRIVATE")}
                    />
                    <SelectCard
                      active={form.visibility === "PUBLIC"}
                      icon={Globe}
                      title="Public"
                      description="Can be exposed to broader discovery and learner access."
                      onClick={() => handleChange("visibility", "PUBLIC")}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/86">
                    {form.visibility === "PUBLIC" ? (
                      <Globe className="h-4 w-4 text-emerald-300" />
                    ) : (
                      <Lock className="h-4 w-4 text-white/55" />
                    )}
                    <span>
                      {form.visibility === "PUBLIC" ? "Public starpath" : "Private starpath"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/58">
                    The starpath starts empty. You will be able to add labs and review analytics after creation.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-white/44">
                  After creation, you can edit the starpath details, attach labs, and access analytics.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}