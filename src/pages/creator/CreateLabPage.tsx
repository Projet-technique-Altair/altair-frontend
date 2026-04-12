import {
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
} from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { ApiError } from "@/api/client";
import { createBuildFromUpload, waitForBuildToBeReady } from "@/api/builder";
import { api } from "@/api";

type CreateLabForm = {
  name: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  visibility: "private" | "public";
  lab_family: "course" | "guided" | "non_guided";
  lab_delivery: "terminal" | "web";
  app_port: string;
  template_path: string;
  estimated_duration: string;
};

type UploadedLabFile = {
  file: File;
  relativePath: string;
  sizeBytes: number;
};

type DirectoryInputProps = InputHTMLAttributes<HTMLInputElement> & {
  webkitdirectory?: string;
  directory?: string;
};

const directoryInputProps: DirectoryInputProps = {
  webkitdirectory: "",
  directory: "",
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

export default function CreateLabPage() {
  const navigate = useNavigate();
  const filesInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<CreateLabForm>({
    name: "",
    description: "",
    difficulty: "easy",
    visibility: "private",
    lab_family: "guided",
    lab_delivery: "terminal",
    app_port: "",
    template_path: "",
    estimated_duration: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedLabFile[]>([]);
  const [isCreatingLab, setIsCreatingLab] = useState(false);
  const [createMessage, setCreateMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChange = (field: string, value: string) => {
    setCreateMessage(null);

    setForm((prev) => ({
      ...prev,
      ...(field === "lab_delivery" && value !== "web" ? { app_port: "" } : {}),
      [field]: value,
    }));
  };

  const parseAppPort = () => {
    const normalized = form.app_port.trim();

    if (form.lab_delivery !== "web") {
      return null;
    }

    if (!normalized) {
      throw new Error("Set the application port for web labs.");
    }

    const parsed = Number.parseInt(normalized, 10);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error("Application port must be a positive integer.");
    }

    return parsed;
  };

  const parseEstimatedDuration = () => {
    const normalized = form.estimated_duration.trim();

    if (!normalized) {
      return undefined;
    }

    if (!/^\d+$/.test(normalized)) {
      throw new Error("Estimated duration must be a positive integer.");
    }

    const parsed = Number.parseInt(normalized, 10);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error("Estimated duration must be a positive integer.");
    }

    return String(parsed);
  };

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const pickedFiles = Array.from(event.target.files ?? []);
    if (pickedFiles.length === 0) return;

    setCreateMessage(null);

    setUploadedFiles((previous) => {
      const next = new Map(previous.map((entry) => [entry.relativePath, entry]));

      for (const file of pickedFiles) {
        const relativePath = file.webkitRelativePath?.trim() || file.name;
        next.set(relativePath, {
          file,
          relativePath,
          sizeBytes: file.size,
        });
      }

      return Array.from(next.values()).sort((left, right) =>
        left.relativePath.localeCompare(right.relativePath),
      );
    });

    setForm((previous) => ({
      ...previous,
      template_path: "",
    }));

    event.target.value = "";
  };

  const buildFilesInBackground = async () => {
    if (uploadedFiles.length === 0) {
      throw new Error("Select lab files before creating the lab.");
    }

    if (!form.name.trim()) {
      throw new Error(
        "Set the lab name first so the builder can derive the image name.",
      );
    }

    const payload = new FormData();
    payload.append("lab_name", form.name.trim());
    payload.append("dockerfile_path", "Dockerfile");

    for (const uploadedFile of uploadedFiles) {
      payload.append("file", uploadedFile.file, uploadedFile.relativePath);
    }

    const response = await createBuildFromUpload(payload);
    const finalBuild =
      response.build_job.status === "READY"
        ? response.build_job
        : await waitForBuildToBeReady(response.build_job.build_id);

    const templatePath = finalBuild.template_path;

    setForm((previous) => ({
      ...previous,
      template_path: templatePath,
    }));

    return templatePath;
  };

  const handleCreate = async () => {
    setIsCreatingLab(true);
    setCreateMessage(null);

    try {
      const appPort = parseAppPort();
      const estimatedDuration = parseEstimatedDuration();
      const templatePath = await buildFilesInBackground();

      const lab = await api.createLab({
        name: form.name,
        description: form.description,
        difficulty: form.difficulty,
        visibility: form.visibility,
        template_path: templatePath,
        lab_family: form.lab_family,
        lab_delivery: form.lab_delivery,
        runtime:
          form.lab_delivery === "web"
            ? {
                app_port: appPort,
                services: [],
                entrypoints: [],
              }
            : undefined,
        estimated_duration: estimatedDuration,
      });

      setCreateMessage({
        type: "success",
        text: "Lab created successfully.",
      });

      window.setTimeout(() => {
        navigate(`/creator/labs/${lab.lab_id}/steps`, { replace: true });
      }, 500);
    } catch (error) {
      console.error("Failed to create lab:", error);

      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Failed to create lab.";

      setCreateMessage({
        type: "error",
        text: message,
      });
    } finally {
      setIsCreatingLab(false);
    }
  };

  const totalUploadSize = uploadedFiles.reduce(
    (total, entry) => total + entry.sizeBytes,
    0,
  );

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
            Creator lab
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white/92 sm:text-4xl">
            Create lab
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
            Define the lab metadata, upload the Docker context, and generate the
            initial lab environment.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/creator/labs/ai")}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/80 transition hover:border-purple-400/30 hover:bg-white/5"
              type="button"
            >
              Generate with AI
            </button>

            <button
              onClick={handleCreate}
              disabled={isCreatingLab}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-sky-400/40 hover:bg-white/5 hover:shadow-[0_0_40px_rgba(56,189,248,0.25)] active:scale-[0.98] ${
                isCreatingLab ? "cursor-not-allowed opacity-60" : ""
              }`}
              type="button"
            >
              {isCreatingLab ? "Building and creating…" : "Create lab"}
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
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Lab content
              </div>

              <div className="mt-4 space-y-4">
                <InputShell>
                  <FieldLabel>Name</FieldLabel>
                  <input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                    placeholder="Lab name"
                  />
                </InputShell>

                <InputShell>
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    rows={5}
                    className="mt-3 w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-white/82 outline-none placeholder:text-white/28"
                    placeholder="Describe the purpose and framing of this lab"
                  />
                </InputShell>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Upload
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white/90">
                      Lab files
                    </h3>
                    <p className="mt-1 text-xs text-white/50">
                      Select the Docker context for the lab. Files are uploaded
                      and built when you create the lab.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => filesInputRef.current?.click()}
                      className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/80 transition hover:border-sky-400/30 hover:bg-white/5"
                    >
                      Add files
                    </button>

                    <button
                      type="button"
                      onClick={() => folderInputRef.current?.click()}
                      className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/80 transition hover:border-purple-400/30 hover:bg-white/5"
                    >
                      Add folder
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFiles([]);
                        setCreateMessage(null);
                        setForm((previous) => ({
                          ...previous,
                          template_path: "",
                        }));
                      }}
                      className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/15 hover:border-red-400/30"
                    >
                      Clear selection
                    </button>
                  </div>
                </div>

                <input
                  ref={filesInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelection}
                />

                <input
                  ref={folderInputRef}
                  {...directoryInputProps}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelection}
                />

                <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-black/20 p-4">
                  {uploadedFiles.length === 0 ? (
                    <p className="text-sm text-white/45">
                      No file selected yet. Add files or pick a folder
                      containing your lab source.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/55">
                        <span>{uploadedFiles.length} file(s) selected</span>
                        <span>{formatBytes(totalUploadSize)}</span>
                      </div>

                      <div className="max-h-40 space-y-2 overflow-auto pr-2">
                        {uploadedFiles.map((entry) => (
                          <div
                            key={entry.relativePath}
                            className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs"
                          >
                            <span className="truncate text-white/80">
                              {entry.relativePath}
                            </span>
                            <span className="shrink-0 text-white/40">
                              {formatBytes(entry.sizeBytes)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <p className="mt-4 text-xs text-white/45">
                  A root <code>Dockerfile</code> is expected by default.
                </p>
              </div>
            </div>
          </div>

          <div className="xl:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Configuration
              </div>

              <div className="mt-5 space-y-4">
                <InputShell>
                  <FieldLabel>Difficulty</FieldLabel>
                  <select
                    value={form.difficulty}
                    onChange={(e) => handleChange("difficulty", e.target.value)}
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none"
                  >
                    <option value="easy" className="bg-[#0f172a]">
                      easy
                    </option>
                    <option value="medium" className="bg-[#0f172a]">
                      medium
                    </option>
                    <option value="hard" className="bg-[#0f172a]">
                      hard
                    </option>
                  </select>
                </InputShell>

                <InputShell>
                  <FieldLabel>Visibility</FieldLabel>
                  <select
                    value={form.visibility}
                    onChange={(e) => handleChange("visibility", e.target.value)}
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none"
                  >
                    <option value="private" className="bg-[#0f172a]">
                      private
                    </option>
                    <option value="public" className="bg-[#0f172a]">
                      public
                    </option>
                  </select>
                </InputShell>

                <InputShell>
                  <FieldLabel>Lab family</FieldLabel>
                  <select
                    value={form.lab_family}
                    onChange={(e) => handleChange("lab_family", e.target.value)}
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none"
                  >
                    <option value="guided" className="bg-[#0f172a]">
                      guided
                    </option>
                    <option value="non_guided" className="bg-[#0f172a]">
                      non_guided
                    </option>
                    <option value="course" className="bg-[#0f172a]">
                      course
                    </option>
                  </select>
                </InputShell>

                <InputShell>
                  <FieldLabel>Delivery</FieldLabel>
                  <select
                    value={form.lab_delivery}
                    onChange={(e) =>
                      handleChange("lab_delivery", e.target.value)
                    }
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none"
                  >
                    <option value="terminal" className="bg-[#0f172a]">
                      terminal
                    </option>
                    <option value="web" className="bg-[#0f172a]">
                      web
                    </option>
                  </select>
                </InputShell>

                {form.lab_delivery === "web" && (
                  <InputShell>
                    <FieldLabel>Application port</FieldLabel>
                    <input
                      value={form.app_port}
                      onChange={(e) => handleChange("app_port", e.target.value)}
                      inputMode="numeric"
                      placeholder="3000"
                      className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                    />
                  </InputShell>
                )}

                <InputShell>
                  <FieldLabel>Estimated duration</FieldLabel>
                  <input
                    value={form.estimated_duration}
                    onChange={(e) =>
                      handleChange("estimated_duration", e.target.value)
                    }
                    inputMode="numeric"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="30"
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                  />
                </InputShell>

                {form.template_path && (
                  <InputShell>
                    <FieldLabel>Resolved template path</FieldLabel>
                    <div className="mt-3 break-all text-sm text-white/76">
                      {form.template_path}
                    </div>
                  </InputShell>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatBytes(value: number) {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}