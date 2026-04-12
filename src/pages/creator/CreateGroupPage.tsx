import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";

import { ApiError } from "@/api/client";
import { api } from "@/api";

type CreateGroupForm = {
  name: string;
  description: string;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[11px] uppercase tracking-wide text-white/50">
      {children}
    </label>
  );
}

function InputShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-black/20 p-4 ${className}`}
    >
      {children}
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
  const [createMessage, setCreateMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChange = (field: keyof CreateGroupForm, value: string) => {
    setCreateMessage(null);

    setForm((prev) => ({
      ...prev,
      [field]: field === "name" ? value.slice(0, 120) : value.slice(0, 1200),
    }));
  };

  const handleCreate = async () => {
    if (isCreatingGroup) return;

    setIsCreatingGroup(true);
    setCreateMessage(null);

    try {
      const payload = {
        name: form.name.replace(/\s+/g, " ").trim(),
        description: form.description.trim(),
      };

      if (!payload.name) {
        throw new Error("Group name cannot be empty.");
      }

      const group = await api.createGroup(payload);

      setCreateMessage({
        type: "success",
        text: "Group created successfully.",
      });

      window.setTimeout(() => {
        navigate(`/creator/group/${group.group_id}`, { replace: true });
      }, 400);
    } catch (error) {
      console.error("Failed to create group:", error);

      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Failed to create group.";

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

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white/92 sm:text-4xl">
            Create group
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
            Create a group to organize learners and assign labs or starpaths.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleCreate}
              disabled={isCreatingGroup}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-sky-400/40 hover:bg-white/5 hover:shadow-[0_0_40px_rgba(56,189,248,0.25)] active:scale-[0.98] ${
                isCreatingGroup ? "cursor-not-allowed opacity-60" : ""
              }`}
              type="button"
            >
              {isCreatingGroup ? "Creating…" : "Create group"}
            </button>
          </div>

          {createMessage && (
            <div
              className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
                createMessage.type === "success"
                  ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                  : "border border-red-400/20 bg-red-500/10 text-red-200"
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
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-white/50">
                <Users className="h-3.5 w-3.5" />
                Group content
              </div>

              <div className="mt-4 space-y-4">
                <InputShell>
                  <FieldLabel>Name</FieldLabel>
                  <input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                    placeholder="Group name"
                  />
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
                </InputShell>
              </div>
            </div>
          </div>

          <div className="xl:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Summary
              </div>

              <div className="mt-5 space-y-4">
                <InputShell>
                  <FieldLabel>Status</FieldLabel>
                  <div className="mt-3 text-sm text-white/76">
                    New group
                  </div>
                </InputShell>

                <InputShell>
                  <FieldLabel>Members</FieldLabel>
                  <div className="mt-3 text-sm text-white/76">
                    0 member
                  </div>
                </InputShell>

                <InputShell>
                  <FieldLabel>Assignments</FieldLabel>
                  <div className="mt-3 text-sm text-white/76">
                    Labs and starpaths can be assigned after creation.
                  </div>
                </InputShell>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}