import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileArchive,
  FolderOpen,
  Globe,
  HardDrive,
  Loader2,
  Lock,
  Shield,
  TerminalSquare,
  Upload,
} from "lucide-react";

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

type CreateStage =
  | "idle"
  | "validating"
  | "uploading"
  | "building"
  | "creating"
  | "success";

const directoryInputProps: DirectoryInputProps = {
  webkitdirectory: "",
  directory: "",
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
      {required && (
        <span className="text-[10px] text-sky-300/80">Required</span>
      )}
    </label>
  );
}

function FieldHint({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 text-xs leading-relaxed text-white/42">{children}</p>
  );
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
  icon: typeof Clock3;
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
  const [createStage, setCreateStage] = useState<CreateStage>("idle");
  const [createMessage, setCreateMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const totalUploadSize = uploadedFiles.reduce(
    (total, entry) => total + entry.sizeBytes,
    0,
  );

  const labName = form.name.trim();
  const description = form.description.trim();
  const hasFiles = uploadedFiles.length > 0;
  const needsWebPort = form.lab_delivery === "web";

  const completion = useMemo(() => {
    let done = 0;
    const total = needsWebPort ? 5 : 4;

    if (labName) done += 1;
    if (description) done += 1;
    if (hasFiles) done += 1;
    if (!needsWebPort || form.app_port.trim()) done += 1;
    if (form.estimated_duration.trim()) done += 1;

    return {
      done,
      total,
      ratio: Math.round((done / total) * 100),
    };
  }, [
    description,
    form.app_port,
    form.estimated_duration,
    hasFiles,
    labName,
    needsWebPort,
  ]);

  const stageLabel =
    createStage === "validating"
      ? "Validating lab data"
      : createStage === "uploading"
        ? "Uploading lab files"
        : createStage === "building"
          ? "Building runtime"
          : createStage === "creating"
            ? "Creating lab"
            : createStage === "success"
              ? "Lab created"
              : "Ready";

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
      throw new Error("Set an estimated duration in minutes.");
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

  const validateBeforeCreate = () => {
    if (!labName) {
      throw new Error("Set the lab name before creating the lab.");
    }

    if (!description) {
      throw new Error("Add a description before creating the lab.");
    }

    if (!hasFiles) {
      throw new Error("Select lab files before creating the lab.");
    }
  };

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const pickedFiles = Array.from(event.target.files ?? []);
    if (pickedFiles.length === 0) return;

    setCreateMessage(null);

    setUploadedFiles((previous) => {
      const next = new Map(
        previous.map((entry) => [entry.relativePath, entry]),
      );

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

  const buildFilesForLab = async () => {
    const payload = new FormData();
    payload.append("lab_name", labName);
    payload.append("dockerfile_path", "Dockerfile");

    for (const uploadedFile of uploadedFiles) {
      payload.append("file", uploadedFile.file, uploadedFile.relativePath);
    }

    setCreateStage("uploading");
    const response = await createBuildFromUpload(payload);

    setCreateStage("building");
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
    setCreateStage("validating");

    try {
      validateBeforeCreate();

      const appPort = parseAppPort();
      const estimatedDuration = parseEstimatedDuration();
      const templatePath = await buildFilesForLab();

      setCreateStage("creating");
      const lab = await api.createLab({
        name: labName,
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

      setCreateStage("success");
      setCreateMessage({
        type: "success",
        text: "Lab created successfully. You will now continue with the steps.",
      });

      window.setTimeout(() => {
        if (form.lab_family === "guided" || form.lab_family === "course") {
          navigate(`/creator/labs/${lab.lab_id}/steps`, { replace: true });
        } else {
          navigate(`/creator/lab/${lab.lab_id}`, { replace: true });
        }
      }, 700);
    } catch (error) {
      console.error("Failed to create lab:", error);

      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Failed to create lab.";

      setCreateStage("idle");
      setCreateMessage({
        type: "error",
        text: message,
      });
    } finally {
      setIsCreatingLab(false);
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
            Creator lab
          </div>

          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white/92 sm:text-4xl">
                Create lab
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
                Define the lab content, configure the runtime, upload the Docker
                context, and create the initial environment.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <SummaryPill
                icon={FileArchive}
                label="Files"
                value={
                  hasFiles ? `${uploadedFiles.length} selected` : "Not selected"
                }
              />
              <SummaryPill
                icon={Clock3}
                label="Estimated duration"
                value={
                  form.estimated_duration.trim()
                    ? `${form.estimated_duration.trim()} min`
                    : "Not set"
                }
              />
              <SummaryPill
                icon={HardDrive}
                label="Progress"
                value={`${completion.done}/${completion.total} fields`}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleCreate}
              disabled={isCreatingLab}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-sky-400/40 hover:bg-white/5 hover:shadow-[0_0_40px_rgba(56,189,248,0.25)] active:scale-[0.98] ${
                isCreatingLab ? "cursor-not-allowed opacity-70" : ""
              }`}
              type="button"
            >
              {isCreatingLab ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{stageLabel}…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Create lab</span>
                </>
              )}
            </button>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/62">
              {createStage === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              ) : isCreatingLab ? (
                <Loader2 className="h-4 w-4 animate-spin text-sky-300" />
              ) : (
                <Clock3 className="h-4 w-4 text-white/45" />
              )}
              <span>{stageLabel}</span>
            </div>
          </div>

          {(isCreatingLab || createStage === "success") && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
              <div
                className={`h-1.5 transition-all duration-500 ${
                  createStage === "validating"
                    ? "w-[15%] bg-sky-400/70"
                    : createStage === "uploading"
                      ? "w-[40%] bg-sky-400/70"
                      : createStage === "building"
                        ? "w-[70%] bg-sky-400/70"
                        : createStage === "creating"
                          ? "w-[90%] bg-sky-400/70"
                          : "w-full bg-emerald-400/70"
                }`}
              />
              <div className="px-4 py-3 text-sm text-white/68">
                {createStage === "validating" &&
                  "Checking required fields before starting the build."}
                {createStage === "uploading" &&
                  "Sending files to the builder service."}
                {createStage === "building" &&
                  "Preparing the runtime image from the uploaded context."}
                {createStage === "creating" &&
                  "Saving the lab configuration and runtime metadata."}
                {createStage === "success" &&
                  "The lab is ready. Redirecting to the steps editor."}
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
                    Lab content
                  </div>
                  <div className="mt-2 text-sm text-white/62">
                    Start with the identity and framing of the lab.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/50">
                  {completion.ratio}% complete
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <InputShell>
                  <FieldLabel required>Name</FieldLabel>
                  <input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                    placeholder="Lab name"
                  />
                  <FieldHint>
                    This name is used for the lab record and to derive the build
                    image name.
                  </FieldHint>
                </InputShell>

                <InputShell>
                  <FieldLabel required>Description</FieldLabel>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    rows={5}
                    className="mt-3 w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-white/82 outline-none placeholder:text-white/28"
                    placeholder="Describe the purpose, context, and expected outcome of the lab"
                  />
                  <FieldHint>
                    Give creators and learners enough context to understand the
                    goal before opening the lab.
                  </FieldHint>
                </InputShell>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-white/50">
                    Upload
                  </div>
                  <div className="mt-2 text-sm text-white/62">
                    Select the Docker context that will be uploaded and built.
                  </div>
                </div>

                {hasFiles && (
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/55">
                    {uploadedFiles.length} file(s) ·{" "}
                    {formatBytes(totalUploadSize)}
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-xl">
                    <h3 className="text-sm font-semibold text-white/90">
                      Lab files
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-white/50">
                      Upload the full lab source folder. A root Dockerfile is
                      expected by default.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => filesInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/80 transition hover:border-sky-400/30 hover:bg-white/5"
                    >
                      <Upload className="h-4 w-4" />
                      Add files
                    </button>

                    <button
                      type="button"
                      onClick={() => folderInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/80 transition hover:border-purple-400/30 hover:bg-white/5"
                    >
                      <FolderOpen className="h-4 w-4" />
                      Add folder
                    </button>

                    <button
                      type="button"
                      disabled={!hasFiles}
                      onClick={() => {
                        setUploadedFiles([]);
                        setCreateMessage(null);
                        setForm((previous) => ({
                          ...previous,
                          template_path: "",
                        }));
                      }}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        hasFiles
                          ? "border-red-400/20 bg-red-500/10 text-red-200 hover:border-red-400/30 hover:bg-red-500/15"
                          : "cursor-not-allowed border-white/10 bg-black/20 text-white/28"
                      }`}
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
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-white/55">
                        <FileArchive className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-sm text-white/58">
                        No files selected yet.
                      </p>
                      <p className="mt-1 max-w-md text-xs leading-relaxed text-white/40">
                        Add files or choose a folder containing the lab source,
                        Dockerfile, and related assets.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/55">
                        <span>{uploadedFiles.length} file(s) selected</span>
                        <span>{formatBytes(totalUploadSize)}</span>
                      </div>

                      <div className="max-h-56 space-y-2 overflow-auto pr-2">
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

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-white/48">
                  The build starts only when you create the lab. Until then, you
                  can still change the metadata and replace the selection.
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 xl:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md xl:sticky xl:top-6">
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

                <div>
                  <FieldLabel>Visibility</FieldLabel>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    <SelectCard
                      active={form.visibility === "private"}
                      icon={Lock}
                      title="Private"
                      description="Visible only in controlled creator or assigned flows."
                      onClick={() => handleChange("visibility", "private")}
                    />
                    <SelectCard
                      active={form.visibility === "public"}
                      icon={Globe}
                      title="Public"
                      description="Can be exposed to broader discovery and learner access."
                      onClick={() => handleChange("visibility", "public")}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Lab family</FieldLabel>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    <SelectCard
                      active={form.lab_family === "guided"}
                      icon={Shield}
                      title="Guided"
                      description="Structured progression with explicit instructions and milestones."
                      onClick={() => handleChange("lab_family", "guided")}
                    />
                    <SelectCard
                      active={form.lab_family === "non_guided"}
                      icon={TerminalSquare}
                      title="Non guided"
                      description="More autonomous exploration with less framing."
                      onClick={() => handleChange("lab_family", "non_guided")}
                    />
                    <SelectCard
                      active={form.lab_family === "course"}
                      icon={Clock3}
                      title="Course"
                      description="Content-oriented flow focused on explanation and learning."
                      onClick={() => handleChange("lab_family", "course")}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Delivery</FieldLabel>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    <SelectCard
                      active={form.lab_delivery === "terminal"}
                      icon={TerminalSquare}
                      title="Terminal"
                      description="Shell or command-line based experience."
                      onClick={() => handleChange("lab_delivery", "terminal")}
                    />
                    <SelectCard
                      active={form.lab_delivery === "web"}
                      icon={Globe}
                      title="Web"
                      description="Browser-based interface exposed through an application port."
                      onClick={() => handleChange("lab_delivery", "web")}
                    />
                  </div>
                </div>

                {form.lab_delivery === "web" && (
                  <InputShell>
                    <FieldLabel required>Application port</FieldLabel>
                    <input
                      value={form.app_port}
                      onChange={(e) => handleChange("app_port", e.target.value)}
                      inputMode="numeric"
                      placeholder="3000"
                      className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                    />
                    <FieldHint>
                      This port is used to expose the web application runtime.
                    </FieldHint>
                  </InputShell>
                )}

                <InputShell>
                  <FieldLabel required>Estimated duration</FieldLabel>
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
                  <FieldHint>
                    Set an approximate duration in minutes to help learners plan
                    their session.
                  </FieldHint>
                </InputShell>

                {form.template_path && (
                  <InputShell>
                    <FieldLabel>Resolved template path</FieldLabel>
                    <div className="mt-3 break-all text-sm leading-relaxed text-white/76">
                      {form.template_path}
                    </div>
                    <FieldHint>
                      This path is generated from the successful build and
                      stored with the lab.
                    </FieldHint>
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
