// src/pages/creator/CreatorGroupDetails.tsx

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
    <div className="text-[11px] uppercase tracking-wide text-white/50">
      {children}
    </div>
  );
}

function DisplayBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/85">
      {children ?? <span className="text-white/40">—</span>}
    </div>
  );
}

export default function CreatorGroupDetails() {
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
        {/* HEADER */}
        <div>
          <button
            onClick={() => navigate("/creator/workspace")}
            className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white/80"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="mt-5 text-[11px] uppercase tracking-[0.22em] text-white/45">
            Creator group
          </div>

          <h1 className="mt-2 text-3xl font-semibold text-white/92 sm:text-4xl">
            {form.name || "New group"}
          </h1>

          <p className="mt-3 max-w-3xl text-sm text-white/70">
            {form.description || "No description provided."}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleCreate}
              disabled={isCreatingGroup}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-sky-400/40 hover:bg-white/5 hover:shadow-[0_0_40px_rgba(56,189,248,0.25)] ${
                isCreatingGroup ? "opacity-60 cursor-not-allowed" : ""
              }`}
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

        {/* CONTENT */}
        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* LEFT */}
          <div className="space-y-6 xl:col-span-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <div className="flex items-center gap-2 text-[11px] uppercase text-white/50">
                <Users className="h-3.5 w-3.5" />
                Group content
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <FieldLabel>Name</FieldLabel>
                  <DisplayBlock>{form.name}</DisplayBlock>
                </div>

                <div>
                  <FieldLabel>Description</FieldLabel>
                  <DisplayBlock>{form.description}</DisplayBlock>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="xl:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <div className="text-[11px] uppercase text-white/50">
                Summary
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <FieldLabel>Status</FieldLabel>
                  <DisplayBlock>New group</DisplayBlock>
                </div>

                <div>
                  <FieldLabel>Members</FieldLabel>
                  <DisplayBlock>0</DisplayBlock>
                </div>

                <div>
                  <FieldLabel>Assignments</FieldLabel>
                  <DisplayBlock>
                    Labs and starpaths can be assigned after creation.
                  </DisplayBlock>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}