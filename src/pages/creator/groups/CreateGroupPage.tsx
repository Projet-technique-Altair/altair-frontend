import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Loader2,
  Save,
  Users,
} from "lucide-react";

import { ApiError } from "@/api/client";
import { api } from "@/api";

type CreateGroupForm = {
  name: string;
  description: string;
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

export default function CreateGroupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateGroupForm>({
    name: "",
    description: "",
  });

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [createStage, setCreateStage] = useState<
    "idle" | "validating" | "creating" | "success"
  >("idle");
  const [createMessage, setCreateMessage] = useState<{
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

  const createLabel =
    createStage === "validating"
      ? "Validating group"
      : createStage === "creating"
        ? "Creating group"
        : createStage === "success"
          ? "Group created"
          : "Ready";

  const handleChange = (field: keyof CreateGroupForm, value: string) => {
    setCreateMessage(null);
    setCreateStage("idle");

    setForm((prev) => ({
      ...prev,
      [field]: field === "name" ? value.slice(0, 120) : value.slice(0, 1200),
    }));
  };

  const handleCreate = async () => {
    if (isCreatingGroup) return;

    setIsCreatingGroup(true);
    setCreateStage("validating");
    setCreateMessage(null);

    try {
      const payload = {
        name: normalizedName,
        description: normalizedDescription,
      };

      if (!payload.name) {
        throw new Error("Group name cannot be empty.");
      }

      setCreateStage("creating");

      const group = await api.createGroup(payload);

      setCreateStage("success");
      setCreateMessage({
        type: "success",
        text: "Group created successfully. Redirecting to the group page.",
      });

      window.setTimeout(() => {
        navigate(`/creator/group/${group.group_id}`, { replace: true });
      }, 700);
    } catch (error) {
      console.error("Failed to create group:", error);

      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Failed to create group.";

      setCreateStage("idle");
      setCreateMessage({
        type: "error",
        text: message,
      });
    } finally {
      setIsCreatingGroup(false);
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
            Creator group
          </div>

          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white/92 sm:text-4xl">
                Create group
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
                Create a group to organize learners and prepare future lab or starpath assignments.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <SummaryPill icon={Users} label="Members" value="0 at creation" />
              <SummaryPill icon={Save} label="Assignments" value="Added later" />
              <SummaryPill icon={CheckCircle2} label="Completion" value={`${completion}%`} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleCreate}
              disabled={isCreatingGroup}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-sky-400/40 hover:bg-white/5 hover:shadow-[0_0_40px_rgba(56,189,248,0.25)] active:scale-[0.98] ${
                isCreatingGroup ? "cursor-not-allowed opacity-60" : ""
              }`}
              type="button"
            >
              {isCreatingGroup ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{createLabel}…</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Create group</span>
                </>
              )}
            </button>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/62">
              {createStage === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              ) : isCreatingGroup ? (
                <Loader2 className="h-4 w-4 animate-spin text-sky-300" />
              ) : (
                <CircleAlert className="h-4 w-4 text-white/45" />
              )}
              <span>{createLabel}</span>
            </div>
          </div>

          {(isCreatingGroup || createStage === "success") && (
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
                  "Checking the group name and preparing the creation request."}
                {createStage === "creating" &&
                  "Creating the group and preparing the management page."}
                {createStage === "success" &&
                  "The group has been created successfully. Redirecting to the group page."}
              </div>
            </div>
          )}

          {createMessage && (
            <div
              className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
                createMessage.type === "success"
                  ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                  : "border-red-400/20 bg-red-500/10 text-red-200"
              }`}
            >
              {createMessage.text}
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
                    Group content
                  </div>
                  <div className="mt-2 text-sm text-white/62">
                    Start with the identity and purpose of the group.
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
                    placeholder="Group name"
                  />
                  <FieldHint>
                    Use a short, recognizable name for creators and learners.
                  </FieldHint>
                </InputShell>

                <InputShell>
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={5}
                    className="mt-3 w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-white/82 outline-none placeholder:text-white/28"
                    placeholder="Describe the purpose and framing of this group"
                  />
                  <FieldHint>
                    Add context about the audience, objective, or learning scope of this group.
                  </FieldHint>
                </InputShell>
              </div>
            </div>
          </div>

          <div className="space-y-6 xl:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md xl:sticky xl:top-6">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Summary
              </div>

              <div className="mt-5 space-y-4">
                <InputShell>
                  <FieldLabel>Status</FieldLabel>
                  <div className="mt-3 text-sm text-white/76">New group</div>
                </InputShell>

                <InputShell>
                  <FieldLabel>Members</FieldLabel>
                  <div className="mt-3 text-sm text-white/76">0 member</div>
                </InputShell>

                <InputShell>
                  <FieldLabel>Assignments</FieldLabel>
                  <div className="mt-3 text-sm text-white/76">
                    Labs and starpaths can be assigned after creation.
                  </div>
                </InputShell>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-white/44">
                  After creation, you can add members, assign labs, assign starpaths, and review group analytics.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}