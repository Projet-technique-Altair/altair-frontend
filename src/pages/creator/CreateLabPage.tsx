import { useRef, useState, type ChangeEvent, type InputHTMLAttributes } from "react";
import { useNavigate } from "react-router-dom";

import DashboardCard from "@/components/ui/DashboardCard";
import { ApiError } from "@/api/client";
import { createBuildFromUpload, type BuildFromUploadResponse } from "@/api/builder";
import { ALT_COLORS } from "@/lib/theme";
import { api } from "@/api";

type CreateLabForm = {
  name: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  visibility: "private" | "public";
  lab_family: "course" | "guided" | "non_guided";
  lab_delivery: "terminal" | "web";
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
    template_path: "",
    estimated_duration: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedLabFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [builderError, setBuilderError] = useState<string | null>(null);
  const [builderResult, setBuilderResult] = useState<BuildFromUploadResponse | null>(null);
  const [isCreatingLab, setIsCreatingLab] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const pickedFiles = Array.from(event.target.files ?? []);

    if (pickedFiles.length === 0) {
      return;
    }

    setBuilderError(null);
    setBuilderResult(null);

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
        left.relativePath.localeCompare(right.relativePath)
      );
    });

    event.target.value = "";
  };

  const handleBuildFiles = async () => {
    if (uploadedFiles.length === 0) {
      setBuilderError("Select at least one file before triggering the build.");
      return;
    }

    if (!form.name.trim()) {
      setBuilderError("Set the lab name first so the builder can derive the image name.");
      return;
    }

    setIsUploading(true);
    setBuilderError(null);
    setCreateError(null);

    try {
      const payload = new FormData();
      payload.append("lab_name", form.name.trim());
      payload.append("dockerfile_path", "Dockerfile");

      for (const uploadedFile of uploadedFiles) {
        payload.append("file", uploadedFile.file, uploadedFile.relativePath);
      }

      const response = await createBuildFromUpload(payload);

      setBuilderResult(response);
      setForm((previous) => ({
        ...previous,
        template_path: response.build_job.template_path,
      }));
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Failed to upload files to the builder";
      setBuilderError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.template_path.trim()) {
      setCreateError("Upload and build files first to generate the template path.");
      return;
    }

    setIsCreatingLab(true);
    setCreateError(null);

    try {
      const lab = await api.createLab({
        name: form.name,
        description: form.description,
        difficulty: form.difficulty,
        visibility: form.visibility,
        template_path: form.template_path,
        lab_family: form.lab_family,
        lab_delivery: form.lab_delivery,
        estimated_duration: form.estimated_duration,
      });
      navigate(`/creator/labs/${lab.lab_id}/steps`);
    } catch (error) {
      console.error("Failed to create lab:", error);
      const message =
        error instanceof ApiError ? error.message : "Failed to create lab";
      setCreateError(message);
    } finally {
      setIsCreatingLab(false);
    }
  };

  const totalUploadSize = uploadedFiles.reduce((total, entry) => total + entry.sizeBytes, 0);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white px-8 py-10 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{
              background: `linear-gradient(90deg, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Create a new lab
          </h1>

          <p className="text-gray-400 text-sm mt-1">
            Fill the lab information then choose how to generate the content.
          </p>
        </div>

        <button
          onClick={() => navigate("/creator/dashboard")}
          className="text-sm text-slate-300 hover:text-white transition"
        >
          ← Back to creator dashboard
        </button>
      </div>

      {/* FORM */}
      <DashboardCard className="
        rounded-3xl
        border border-white/10
        bg-white/[0.04]
        backdrop-blur-xl
        p-8
        shadow-[0_25px_80px_rgba(0,0,0,0.45)]
        space-y-6
        transition
        hover:border-white/15
        ">

	          <div>
	            <h2 className="text-lg font-semibold text-white/90">
	              Lab Information
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Define the base metadata of your lab.
	            </p>
	          </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white/90">
                    Upload lab files
                  </h3>
                  <p className="text-xs text-white/50 mt-1">
                    Send the Docker context to the lab builder. The returned template path will
                    be injected into the form automatically.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => filesInputRef.current?.click()}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/80 transition hover:border-sky-400/40 hover:text-white"
                  >
                    Add files
                  </button>
                  <button
                    type="button"
                    onClick={() => folderInputRef.current?.click()}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/80 transition hover:border-purple-400/40 hover:text-white"
                  >
                    Add folder
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFiles([]);
                      setBuilderResult(null);
                      setBuilderError(null);
                    }}
                    className="rounded-xl border border-red-400/20 bg-red-500/5 px-4 py-2 text-xs text-red-200 transition hover:border-red-400/40 hover:bg-red-500/10"
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

              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4">
                {uploadedFiles.length === 0 ? (
                  <p className="text-sm text-white/45">
                    No file selected yet. Add files or pick a folder containing your lab source.
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
                          <span className="truncate text-white/80">{entry.relativePath}</span>
                          <span className="shrink-0 text-white/40">
                            {formatBytes(entry.sizeBytes)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleBuildFiles}
                  disabled={isUploading || uploadedFiles.length === 0}
                  className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/15 hover:border-emerald-400/50 hover:shadow-[0_0_14px_rgba(52,211,153,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploading ? "Uploading and building..." : "Upload and build files"}
                </button>

                <span className="text-xs text-white/45">
                  Root `Dockerfile` expected by default.
                </span>
              </div>

              {builderError ? (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {builderError}
                </div>
              ) : null}

              {builderResult ? (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100 space-y-2">
                  <p className="font-medium">Builder completed successfully.</p>
                  <p>
                    Template path generated:{" "}
                    <span className="font-mono text-emerald-200">
                      {builderResult.build_job.template_path}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-emerald-100/80">
                    <span>Status: {builderResult.build_job.status}</span>
                    <span>Mode: {builderResult.build_job.dispatch_mode}</span>
                    <span>Files: {builderResult.source_bundle.file_count}</span>
                  </div>
                </div>
              ) : null}
            </div>

	          <div className="grid grid-cols-2 gap-5">

            <div className="col-span-2">
              <label className="text-[11px] uppercase tracking-widest text-white/35">
                Name
              </label>
              <input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="
                mt-1 w-full
                rounded-2xl
                border border-white/10
                bg-black/30
                px-4 py-3
                text-sm text-white
                outline-none
                transition-all

                hover:border-sky-400/30
                hover:bg-black/40
                hover:shadow-[0_0_12px_rgba(120,200,255,0.15)]

                focus:border-sky-400/50
                focus:shadow-[0_0_18px_rgba(120,200,255,0.25)]
                "
              />
            </div>

            <div className="col-span-2">
              <label className="text-[11px] uppercase tracking-widest text-white/35">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="
                mt-1 w-full
                rounded-2xl
                border border-white/10
                bg-black/30
                px-4 py-3
                text-sm text-white
                outline-none
                transition-all

                hover:border-purple-400/30
                hover:bg-black/40
                hover:shadow-[0_0_12px_rgba(180,120,255,0.15)]

                focus:border-purple-400/50
                focus:shadow-[0_0_18px_rgba(180,120,255,0.25)]
                "
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-widest text-white/35">
                Difficulty
              </label>
              <select
                value={form.difficulty}
                onChange={(e) => handleChange("difficulty", e.target.value)}
                className="
                mt-1 w-full
                rounded-2xl
                border border-white/10
                bg-black/30
                px-4 py-3
                text-sm text-white
                outline-none
                transition-all

                hover:border-sky-400/30
                hover:bg-black/40
                hover:shadow-[0_0_12px_rgba(120,200,255,0.15)]

                focus:border-sky-400/50
                focus:shadow-[0_0_18px_rgba(120,200,255,0.25)]
                "
              >
                <option value="easy">easy</option>
                <option value="medium">medium</option>
                <option value="hard">hard</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-widest text-white/35">
                Visibility
              </label>
              <select
                value={form.visibility}
                onChange={(e) => handleChange("visibility", e.target.value)}
                className="
                mt-1 w-full
                rounded-2xl
                border border-white/10
                bg-black/30
                px-4 py-3
                text-sm text-white
                outline-none
                transition-all

                hover:border-orange-400/30
                hover:bg-black/40
                hover:shadow-[0_0_12px_rgba(255,170,100,0.15)]

                focus:border-orange-400/50
                focus:shadow-[0_0_18px_rgba(255,170,100,0.25)]
                "
              >
                <option value="private">private</option>
                <option value="public">public</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-widest text-white/35">
                Lab family
              </label>
              <select
                value={form.lab_family}
                onChange={(e) => handleChange("lab_family", e.target.value)}
                className="
                mt-1 w-full
                rounded-2xl
                border border-white/10
                bg-black/30
                px-4 py-3
                text-sm text-white
                outline-none
                transition-all

                hover:border-sky-400/30
                hover:bg-black/40
                hover:shadow-[0_0_12px_rgba(120,200,255,0.15)]

                focus:border-sky-400/50
                focus:shadow-[0_0_18px_rgba(120,200,255,0.25)]
                "
              >
                <option value="guided">guided</option>
                <option value="non_guided">non_guided</option>
                <option value="course">course</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-widest text-white/35">
                Lab delivery
              </label>
              <select
                value={form.lab_delivery}
                onChange={(e) => handleChange("lab_delivery", e.target.value)}
                className="
                mt-1 w-full
                rounded-2xl
                border border-white/10
                bg-black/30
                px-4 py-3
                text-sm text-white
                outline-none
                transition-all

                hover:border-purple-400/30
                hover:bg-black/40
                hover:shadow-[0_0_12px_rgba(180,120,255,0.15)]

                focus:border-purple-400/50
                focus:shadow-[0_0_18px_rgba(180,120,255,0.25)]
                "
              >
                <option value="terminal">terminal</option>
                <option value="web">web</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-widest text-white/35">
                Estimated duration
              </label>
              <input
                value={form.estimated_duration}
                onChange={(e) => handleChange("estimated_duration", e.target.value)}
                className="
                mt-1 w-full
                rounded-2xl
                border border-white/10
                bg-black/30
                px-4 py-3
                text-sm text-white
                outline-none
                transition-all

                hover:border-sky-400/30
                hover:bg-black/40
                hover:shadow-[0_0_12px_rgba(120,200,255,0.15)]

                focus:border-sky-400/50
                focus:shadow-[0_0_18px_rgba(120,200,255,0.25)]
                "
              />
            </div>

	            <div className="col-span-2">
	              <label className="text-[11px] uppercase tracking-widest text-white/35">
	                Builder output
	              </label>
                  <div className="mt-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80">
                    {form.template_path ? (
                      <span className="font-mono break-all">{form.template_path}</span>
                    ) : (
                      <span className="text-white/40">
                        No template path generated yet. Upload and build files to continue.
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-white/45">
                    The lab builder generates the template path automatically after a successful build.
                  </p>
	            </div>

          </div>

	          <div className="flex gap-4 pt-2">

            <button
              onClick={() => navigate("/creator/labs/ai")}
              className="
              px-5 py-2
              rounded-xl
              border border-purple-400/30
              bg-purple-500/10
              text-purple-200
              text-sm
              transition

              hover:bg-purple-500/15
              hover:border-purple-400/50
              hover:shadow-[0_0_14px_rgba(180,120,255,0.25)]
              "
            >
              Generate with AI Prof
            </button>

	            <button
	              onClick={handleCreate}
                  disabled={isCreatingLab || !form.template_path.trim()}
	              className="
	              px-5 py-2
              rounded-xl
              border border-sky-400/30
              bg-sky-500/10
              text-sky-200
              text-sm
              font-medium
              transition

              hover:bg-sky-500/15
              hover:border-sky-400/50
              hover:shadow-[0_0_14px_rgba(120,200,255,0.35)]
	              disabled:cursor-not-allowed disabled:opacity-50
	              "
	            >
	              {isCreatingLab ? "Creating..." : "Create lab"}
	            </button>

	          </div>

              {createError ? (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {createError}
                </div>
              ) : null}

	        </DashboardCard>
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
