import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  FileText,
  Folder,
  Globe,
  ListOrdered,
  Loader2,
  Lock,
  Plus,
  RefreshCcw,
  Save,
  Search,
  TerminalSquare,
  Trash2,
  Upload,
} from "lucide-react";

import { api } from "@/api";
import { createBuildFromUpload, waitForBuildToBeReady } from "@/api/builder";
import { getEditableSteps } from "@/api/labs";
import type { LabFileEntry, LabHint, LabStep } from "@/api/types";

type Hint = LabHint;

type Step = LabStep & {
  validation_type: "exact_match" | "contains" | "regex";
  validation_pattern?: string | null;
  points: number;
  hints: Hint[];
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
  icon: typeof ListOrdered;
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

function buildEmptyStep(stepNumber: number): Step {
  return {
    step_number: stepNumber,
    title: "",
    description: "",
    question: "",
    expected_answer: "",
    validation_type: "exact_match",
    validation_pattern: null,
    points: 10,
    hints: [],
  };
}

function folderExistsInFiles(folder: string, files: LabFileEntry[]) {
  if (!folder) {
    return true;
  }
  const prefix = `${folder}/`;
  return files.some((item) => item.path.startsWith(prefix));
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export default function CreatorLabEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<{
    name: string;
    description: string;
    difficulty: "easy" | "medium" | "hard";
    visibility: "private" | "public";
    template_path: string;
    lab_type: string;
    lab_delivery: "terminal" | "web";
    app_port: string;
    estimated_duration: string;
  }>({
    name: "",
    description: "",
    difficulty: "easy",
    visibility: "private",
    template_path: "",
    lab_type: "",
    lab_delivery: "terminal",
    app_port: "",
    estimated_duration: "",
  });

  const [steps, setSteps] = useState<Step[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStage, setSaveStage] = useState<
    "idle" | "validating" | "saving" | "rebuilding" | "success"
  >("idle");
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [labFiles, setLabFiles] = useState<LabFileEntry[]>([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [filesRefreshing, setFilesRefreshing] = useState(false);
  const [filesUploading, setFilesUploading] = useState(false);
  const [deletingFilePath, setDeletingFilePath] = useState<string | null>(null);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState("");
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState("");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (field: string, value: string) => {
    setSaveMessage(null);
    setSaveStage("idle");
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

  const loadLabFiles = async ({ initial = false }: { initial?: boolean } = {}) => {
    if (!id) return;

    if (initial) {
      setFilesLoading(true);
    } else {
      setFilesRefreshing(true);
    }
    setFilesError(null);

    try {
      const files = await api.listLabFiles(id);
      setLabFiles(files);

      if (!folderExistsInFiles(currentFolder, files)) {
        setCurrentFolder("");
      }

      if (previewPath && !files.some((file) => file.path === previewPath)) {
        setPreviewPath(null);
        setPreviewContent("");
        setPreviewError(null);
      }
    } catch (error) {
      setFilesError(getErrorMessage(error, "Failed to load lab files."));
    } finally {
      if (initial) {
        setFilesLoading(false);
      } else {
        setFilesRefreshing(false);
      }
    }
  };

  const openUploadDialog = () => {
    uploadInputRef.current?.click();
  };

  const handleUploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !id) {
      return;
    }

    const targetPath = currentFolder ? `${currentFolder}/${file.name}` : file.name;

    setFilesUploading(true);
    setFilesError(null);
    try {
      await api.uploadLabFile(id, targetPath, file);
      await loadLabFiles();
    } catch (error) {
      setFilesError(getErrorMessage(error, "Failed to upload the selected file."));
    } finally {
      setFilesUploading(false);
    }
  };

  const handleDeleteFile = async (path: string) => {
    if (!id) return;
    const confirmed = window.confirm(`Delete file "${path}"?`);
    if (!confirmed) return;

    setDeletingFilePath(path);
    setFilesError(null);
    try {
      await api.deleteLabFile(id, path);
      if (previewPath === path) {
        setPreviewPath(null);
        setPreviewContent("");
        setPreviewError(null);
      }
      await loadLabFiles();
    } catch (error) {
      setFilesError(getErrorMessage(error, `Failed to delete "${path}".`));
    } finally {
      setDeletingFilePath(null);
    }
  };

  const handlePreviewFile = async (path: string) => {
    if (!id) return;

    setPreviewPath(path);
    setPreviewLoading(true);
    setPreviewError(null);

    try {
      const content = await api.getLabFilePreview(id, path);
      setPreviewContent(content);
    } catch (error) {
      setPreviewContent("");
      setPreviewError(getErrorMessage(error, `Failed to preview "${path}".`));
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadLab() {
      setLoading(true);
      setLoadError(null);

      try {
        const lab = await api.getLab(id!);
        const stepsData = await getEditableSteps(id!);

        const stepsWithHints = await Promise.all(
          stepsData.map(async (step) => {
            const hints = step.step_id ? await api.getHints(id!, step.step_id) : [];

            return {
              ...step,
              validation_type: step.validation_type ?? "exact_match",
              validation_pattern: step.validation_pattern ?? null,
              points: step.points ?? 0,
              hints,
            } as Step;
          }),
        );

        if (cancelled) return;

        setSteps(stepsWithHints);
        setExpandedSteps(
          stepsWithHints.reduce<Record<number, boolean>>((acc, _step, index) => {
            acc[index] = index === 0;
            return acc;
          }, {}),
        );

        setForm({
          name: lab.name ?? "",
          description: lab.description ?? "",
          difficulty:
            lab.difficulty === "EASY"
              ? "easy"
              : lab.difficulty === "MEDIUM"
                ? "medium"
                : lab.difficulty === "HARD"
                  ? "hard"
                  : "easy",
          visibility:
            lab.visibility === "PUBLIC"
              ? "public"
              : lab.visibility === "PRIVATE"
                ? "private"
                : "private",
          template_path: lab.template_path ?? "",
          lab_type: lab.lab_type ?? "",
          lab_delivery: lab.lab_delivery === "web" ? "web" : "terminal",
          app_port:
            lab.lab_delivery === "web" && lab.runtime?.app_port != null
              ? String(lab.runtime.app_port)
              : "",
          estimated_duration: lab.estimated_duration ?? "",
        });
      } catch (err) {
        console.error("Failed to load lab", err);

        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Failed to load lab editor.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLab();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    void loadLabFiles({ initial: true });
  }, [id]);

  const renumberSteps = (items: Step[]) =>
    items.map((step, index) => ({
      ...step,
      step_number: index + 1,
      hints: step.hints.map((hint, hintIndex) => ({
        ...hint,
        hint_number: hintIndex + 1,
      })),
    }));

  const totalHints = useMemo(
    () => steps.reduce((sum, step) => sum + step.hints.length, 0),
    [steps],
  );

  const completion = useMemo(() => {
    let filled = 0;
    let total = 0;

    if (form.name.trim()) filled += 1;
    if (form.description.trim()) filled += 1;
    if (form.estimated_duration.trim()) filled += 1;
    total += 3;

    if (form.lab_delivery === "web") {
      total += 1;
      if (form.app_port.trim()) filled += 1;
    }

    for (const step of steps) {
      total += 4;
      if (step.title.trim()) filled += 1;
      if (step.description.trim()) filled += 1;
      if (step.question.trim()) filled += 1;
      if (step.expected_answer.trim()) filled += 1;

      if (step.validation_type === "regex") {
        total += 1;
        if ((step.validation_pattern ?? "").trim()) filled += 1;
      }
    }

    return total === 0 ? 0 : Math.round((filled / total) * 100);
  }, [form, steps]);

  const incompleteSteps = useMemo(
    () =>
      steps.filter((step) => {
        if (!step.title.trim()) return true;
        if (!step.description.trim()) return true;
        if (!step.question.trim()) return true;
        if (!step.expected_answer.trim()) return true;
        if (!Number.isFinite(step.points) || step.points <= 0) return true;
        if (
          step.validation_type === "regex" &&
          !(step.validation_pattern ?? "").trim()
        ) {
          return true;
        }
        return step.hints.some(
          (hint) =>
            !hint.text.trim() || !Number.isFinite(hint.cost) || hint.cost < 0,
        );
      }).length,
    [steps],
  );

  const folderSegments = useMemo(
    () => (currentFolder ? currentFolder.split("/") : []),
    [currentFolder],
  );

  const folderEntries = useMemo(() => {
    const prefix = currentFolder ? `${currentFolder}/` : "";
    const directories = new Set<string>();
    const files: LabFileEntry[] = [];

    for (const item of labFiles) {
      if (!item.path.startsWith(prefix)) {
        continue;
      }

      const remaining = item.path.slice(prefix.length);
      if (!remaining) {
        continue;
      }

      const slashIndex = remaining.indexOf("/");
      if (slashIndex === -1) {
        files.push(item);
        continue;
      }

      directories.add(remaining.slice(0, slashIndex));
    }

    files.sort((a, b) => a.path.localeCompare(b.path));

    return {
      directories: Array.from(directories).sort((a, b) => a.localeCompare(b)),
      files,
    };
  }, [currentFolder, labFiles]);

  const totalFileSize = useMemo(
    () => labFiles.reduce((sum, item) => sum + item.size, 0),
    [labFiles],
  );

  const updateStep = (index: number, patch: Partial<Step>) => {
    setSteps((prev) =>
      prev.map((step, i) => {
        if (i !== index) return step;

        const nextStep = { ...step, ...patch };

        if (
          patch.validation_type &&
          patch.validation_type !== "regex" &&
          nextStep.validation_pattern
        ) {
          nextStep.validation_pattern = null;
        }

        return nextStep;
      }),
    );
    setSaveMessage(null);
    setSaveStage("idle");
  };

  const updateHint = (
    stepIndex: number,
    hintIndex: number,
    patch: Partial<Hint>,
  ) => {
    setSteps((prev) =>
      prev.map((step, i) => {
        if (i !== stepIndex) return step;

        return {
          ...step,
          hints: step.hints.map((hint, j) =>
            j === hintIndex ? { ...hint, ...patch } : hint,
          ),
        };
      }),
    );
    setSaveMessage(null);
    setSaveStage("idle");
  };

  const addStep = () => {
    setSteps((prev) => [...prev, buildEmptyStep(prev.length + 1)]);
    setExpandedSteps((prev) => ({
      ...Object.fromEntries(Object.keys(prev).map((key) => [Number(key), false])),
      [steps.length]: true,
    }));
    setSaveMessage(null);
    setSaveStage("idle");
  };

  const addHint = (stepIndex: number) => {
    setSteps((prev) =>
      prev.map((step, i) => {
        if (i !== stepIndex) return step;

        return {
          ...step,
          hints: [
            ...step.hints,
            {
              hint_number: step.hints.length + 1,
              cost: 0,
              text: "",
            },
          ],
        };
      }),
    );
    setSaveMessage(null);
    setSaveStage("idle");
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    setSteps((prev) => {
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return renumberSteps(next);
    });

    setExpandedSteps((prev) => {
      const next = { ...prev };
      const currentExpanded = prev[index] ?? false;
      const targetExpanded = prev[targetIndex] ?? false;
      next[index] = targetExpanded;
      next[targetIndex] = currentExpanded;
      return next;
    });

    setSaveMessage(null);
    setSaveStage("idle");
  };

  const toggleExpanded = (index: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const openOnlyStep = (index: number) => {
    setExpandedSteps(
      steps.reduce<Record<number, boolean>>((acc, _step, stepIndex) => {
        acc[stepIndex] = stepIndex === index;
        return acc;
      }, {}),
    );
  };

  const handleDeleteStep = async (stepIndex: number) => {
    const step = steps[stepIndex];
    const confirmed = window.confirm(
      `Delete step ${step.step_number}${
        step.title?.trim() ? `: ${step.title}` : ""
      }?`,
    );

    if (!confirmed) return;

    try {
      if (step.step_id) {
        await api.deleteStep(id!, step.step_id);
      }

      setSteps((prev) => renumberSteps(prev.filter((_, i) => i !== stepIndex)));
      setExpandedSteps((prev) => {
        const next: Record<number, boolean> = {};
        const remainingIndexes = steps
          .map((_, i) => i)
          .filter((i) => i !== stepIndex);

        remainingIndexes.forEach((oldIndex, newIndex) => {
          next[newIndex] = prev[oldIndex] ?? false;
        });

        if (Object.values(next).every((value) => !value) && remainingIndexes.length > 0) {
          next[0] = true;
        }

        return next;
      });
      setSaveMessage(null);
      setSaveStage("idle");
    } catch (err) {
      console.error("Failed to delete step", err);
      setSaveMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete step.",
      });
    }
  };

  const handleDeleteHint = async (stepIndex: number, hintIndex: number) => {
    const step = steps[stepIndex];
    const hint = step.hints[hintIndex];
    const confirmed = window.confirm(
      `Delete hint ${hint.hint_number} from step ${step.step_number}?`,
    );

    if (!confirmed) return;

    try {
      if (hint.hint_id && step.step_id) {
        await api.deleteHint(id!, step.step_id, hint.hint_id);
      }

      setSteps((prev) =>
        prev.map((currentStep, i) => {
          if (i !== stepIndex) return currentStep;

          const nextHints = currentStep.hints
            .filter((_, j) => j !== hintIndex)
            .map((currentHint, idx) => ({
              ...currentHint,
              hint_number: idx + 1,
            }));

          return {
            ...currentStep,
            hints: nextHints,
          };
        }),
      );
      setSaveMessage(null);
      setSaveStage("idle");
    } catch (err) {
      console.error("Failed to delete hint", err);
      setSaveMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete hint.",
      });
    }
  };

  const validateBeforeSave = () => {
    if (!form.name.trim()) {
      throw new Error("Lab name is required.");
    }

    if (!form.description.trim()) {
      throw new Error("Lab description is required.");
    }

    for (const step of steps) {
      if (!step.title.trim()) {
        throw new Error(`Step ${step.step_number}: title is required.`);
      }

      if (!step.description.trim()) {
        throw new Error(`Step ${step.step_number}: description is required.`);
      }

      if (!step.question.trim()) {
        throw new Error(`Step ${step.step_number}: question is required.`);
      }

      if (!step.expected_answer.trim()) {
        throw new Error(`Step ${step.step_number}: expected answer is required.`);
      }

      if (!Number.isFinite(step.points) || step.points <= 0) {
        throw new Error(`Step ${step.step_number}: points must be greater than 0.`);
      }

      if (
        step.validation_type === "regex" &&
        !(step.validation_pattern ?? "").trim()
      ) {
        throw new Error(`Step ${step.step_number}: regex pattern is required.`);
      }

      for (const hint of step.hints) {
        if (!hint.text.trim()) {
          throw new Error(`Step ${step.step_number}: hint text cannot be empty.`);
        }

        if (!Number.isFinite(hint.cost) || hint.cost < 0) {
          throw new Error(`Step ${step.step_number}: hint cost cannot be negative.`);
        }
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStage("validating");
    setSaveMessage(null);

    try {
      validateBeforeSave();

      const appPort = parseAppPort();
      const estimatedDuration = parseEstimatedDuration();
      let rebuiltTemplatePath: string | null = null;

      if (labFiles.length > 0) {
        setSaveStage("rebuilding");

        const payload = new FormData();
        payload.append("lab_name", form.name.trim() || `lab-${id}`);
        payload.append("dockerfile_path", "Dockerfile");

        for (const file of labFiles) {
          const blob = await api.downloadLabFile(id!, file.path);
          const basename = file.path.split("/").pop() || "file";
          payload.append("file", new File([blob], basename), file.path);
        }

        const response = await createBuildFromUpload(payload);
        const finalBuild =
          response.build_job.status === "READY"
            ? response.build_job
            : await waitForBuildToBeReady(response.build_job.build_id);
        rebuiltTemplatePath = finalBuild.template_path;
      }

      setSaveStage("saving");

      await api.updateLab(id!, {
        name: form.name.trim(),
        description: form.description.trim(),
        difficulty: form.difficulty,
        visibility: form.visibility,
        template_path: (rebuiltTemplatePath ?? form.template_path).trim(),
        lab_type: form.lab_type.trim(),
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

      for (const step of steps) {
        let stepId = step.step_id;

        const stepPayload = {
          ...step,
          title: step.title.trim(),
          description: step.description.trim(),
          question: step.question.trim(),
          expected_answer: step.expected_answer.trim(),
          validation_pattern:
            step.validation_type === "regex"
              ? step.validation_pattern?.trim() || null
              : null,
          hints: undefined,
        };

        if (stepId) {
          await api.updateStep(id!, stepId, stepPayload);
        } else {
          const created = await api.createStep(id!, stepPayload);
          stepId = created.step_id;

          if (!stepId) {
            throw new Error("Created step is missing step_id");
          }
        }

        for (const hint of step.hints) {
          const hintPayload = {
            ...hint,
            text: hint.text.trim(),
          };

          if (hint.hint_id) {
            await api.updateHint(id!, stepId, hint.hint_id, hintPayload);
          } else {
            await api.createHint(id!, stepId, hintPayload);
          }
        }
      }

      if (rebuiltTemplatePath) {
        setForm((prev) => ({
          ...prev,
          template_path: rebuiltTemplatePath!,
        }));
      }

      setSaveStage("success");
      setSaveMessage({
        type: "success",
        text: rebuiltTemplatePath
          ? "Changes saved and runtime rebuilt successfully. Redirecting to the lab overview."
          : "Changes saved successfully. Redirecting to the lab overview.",
      });

      window.setTimeout(() => {
        navigate(`/creator/lab/${id}`);
      }, 700);
    } catch (err) {
      console.error("Failed to update lab", err);
      setSaveStage("idle");
      setSaveMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save changes.",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveLabel =
    saveStage === "validating"
      ? "Validating changes"
      : saveStage === "rebuilding"
        ? "Rebuilding runtime image"
      : saveStage === "saving"
        ? "Saving changes"
        : saveStage === "success"
          ? "Saved"
          : "Ready";

  if (loading) {
    return (
      <div className="min-h-screen w-full text-white">
        <div className="mx-auto w-full max-w-[1680px] px-6 py-10 xl:px-10 2xl:px-14">
          <div className="animate-pulse">
            <div className="h-5 w-24 rounded bg-white/10" />
            <div className="mt-6 h-3 w-28 rounded bg-white/10" />
            <div className="mt-3 h-10 w-72 rounded bg-white/10" />
            <div className="mt-4 h-5 w-[32rem] max-w-full rounded bg-white/10" />
            <div className="mt-8 h-px w-full bg-white/10" />
            <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
              <div className="space-y-6 xl:col-span-8">
                <div className="h-48 rounded-3xl border border-white/10 bg-white/5" />
                <div className="h-[34rem] rounded-3xl border border-white/10 bg-white/5" />
              </div>
              <div className="xl:col-span-4">
                <div className="h-[34rem] rounded-3xl border border-white/10 bg-white/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen w-full text-white">
        <div className="mx-auto w-full max-w-[1680px] px-6 py-10 xl:px-10 2xl:px-14">
          <button
            onClick={() => navigate(`/creator/lab/${id}`)}
            className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white/80"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="mt-8 rounded-3xl border border-red-400/20 bg-red-500/10 p-6">
            <div className="text-base font-semibold text-red-100">
              Failed to load editor
            </div>
            <div className="mt-2 text-sm leading-relaxed text-red-200/90">
              {loadError}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => window.location.reload()}
                className="rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-500/15"
                type="button"
              >
                Retry
              </button>
              <button
                onClick={() => navigate(`/creator/lab/${id}`)}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/82 transition hover:bg-white/5"
                type="button"
              >
                Return to lab
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full text-white">
      <div className="mx-auto w-full max-w-[1680px] px-6 py-10 xl:px-10 2xl:px-14">
        <div>
          <button
            onClick={() => navigate(`/creator/lab/${id}`)}
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
                Edit lab
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
                Update the lab identity, configuration, and progression while keeping
                the creator flow consistent with the rest of the workspace.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <SummaryPill
                icon={ListOrdered}
                label="Steps"
                value={`${steps.length}`}
              />
              <SummaryPill
                icon={CheckCircle2}
                label="Hints"
                value={`${totalHints}`}
              />
              <SummaryPill
                icon={Save}
                label="Completion"
                value={`${completion}%`}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-sky-400/40 hover:bg-white/5 hover:shadow-[0_0_40px_rgba(56,189,248,0.25)] active:scale-[0.98] ${
                saving ? "cursor-not-allowed opacity-70" : ""
              }`}
              type="button"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{saveLabel}…</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save changes</span>
                </>
              )}
            </button>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/62">
              {saveStage === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              ) : saving ? (
                <Loader2 className="h-4 w-4 animate-spin text-sky-300" />
              ) : (
                <CircleAlert className="h-4 w-4 text-white/45" />
              )}
              <span>{saveLabel}</span>
            </div>
          </div>

          {(saving || saveStage === "success") && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
              <div
                className={`h-1.5 transition-all duration-500 ${
                  saveStage === "validating"
                    ? "w-[28%] bg-sky-400/70"
                    : saveStage === "rebuilding"
                      ? "w-[58%] bg-sky-400/70"
                    : saveStage === "saving"
                      ? "w-[82%] bg-sky-400/70"
                      : "w-full bg-emerald-400/70"
                }`}
              />
              <div className="px-4 py-3 text-sm text-white/68">
                {saveStage === "validating" &&
                  "Checking metadata, runtime settings, steps, and hints before saving."}
                {saveStage === "rebuilding" &&
                  "Rebuilding the runtime image from files currently stored in lab storage."}
                {saveStage === "saving" &&
                  "Updating the lab configuration and synchronizing steps and hints."}
                {saveStage === "success" &&
                  "All changes have been saved successfully. Redirecting to the lab overview."}
              </div>
            </div>
          )}

          {saveMessage && (
            <div
              className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
                saveMessage.type === "success"
                  ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                  : "border-red-400/20 bg-red-500/10 text-red-200"
              }`}
            >
              {saveMessage.text}
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
                    Update the identity and framing of the lab.
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
                    placeholder="Lab name"
                  />
                </InputShell>

                <InputShell>
                  <FieldLabel required>Description</FieldLabel>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={5}
                    className="mt-3 w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-white/82 outline-none placeholder:text-white/28"
                    placeholder="Describe the purpose and framing of this lab"
                  />
                </InputShell>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-white/50">
                    Steps
                  </div>
                  <div className="mt-2 text-sm text-white/60">
                    Manage order, validation, scoring, and hints from one flow.
                  </div>
                </div>

                <button
                  onClick={addStep}
                  disabled={saving}
                  className={`inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/82 transition hover:border-purple-400/30 hover:bg-white/5 ${
                    saving ? "cursor-not-allowed opacity-60" : ""
                  }`}
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add step</span>
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {steps.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-white/50">
                    No steps available yet. Add a step to define the first milestone.
                  </div>
                ) : (
                  steps.map((step, stepIndex) => {
                    const isExpanded = expandedSteps[stepIndex] ?? false;
                    const isRegex = step.validation_type === "regex";

                    return (
                      <div
                        key={step.step_id ?? stepIndex}
                        className="rounded-2xl border border-white/10 bg-black/20 p-5"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="text-[11px] uppercase tracking-wide text-white/45">
                              Step {step.step_number}
                            </div>
                            <div className="mt-2 truncate text-base font-semibold text-white/90">
                              {step.title.trim() || `Untitled step ${step.step_number}`}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/50">
                              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
                                {step.points} pts
                              </span>
                              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
                                {step.validation_type.replace("_", " ")}
                              </span>
                              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
                                {step.hints.length} hint{step.hints.length > 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => moveStep(stepIndex, -1)}
                              disabled={stepIndex === 0 || saving}
                              className={`rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/75 transition hover:border-white/15 hover:bg-white/5 ${
                                stepIndex === 0 || saving
                                  ? "cursor-not-allowed opacity-35"
                                  : ""
                              }`}
                              type="button"
                              aria-label={`Move step ${step.step_number} up`}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => moveStep(stepIndex, 1)}
                              disabled={stepIndex === steps.length - 1 || saving}
                              className={`rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/75 transition hover:border-white/15 hover:bg-white/5 ${
                                stepIndex === steps.length - 1 || saving
                                  ? "cursor-not-allowed opacity-35"
                                  : ""
                              }`}
                              type="button"
                              aria-label={`Move step ${step.step_number} down`}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => toggleExpanded(stepIndex)}
                              className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/75 transition hover:border-white/15 hover:bg-white/5"
                              type="button"
                            >
                              {isExpanded ? "Collapse" : "Expand"}
                            </button>

                            <button
                              disabled={saving}
                              onClick={() => handleDeleteStep(stepIndex)}
                              className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs transition ${
                                saving
                                  ? "cursor-not-allowed border-white/10 bg-black/20 text-white/28"
                                  : "border-red-400/20 bg-red-500/10 text-red-200 hover:border-red-400/30 hover:bg-red-500/15"
                              }`}
                              type="button"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-5 space-y-4">
                            <InputShell>
                              <FieldLabel required>Title</FieldLabel>
                              <input
                                value={step.title}
                                onChange={(e) =>
                                  updateStep(stepIndex, { title: e.target.value })
                                }
                                className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                                placeholder="Step title"
                              />
                            </InputShell>

                            <InputShell>
                              <FieldLabel required>Description</FieldLabel>
                              <textarea
                                value={step.description}
                                onChange={(e) =>
                                  updateStep(stepIndex, {
                                    description: e.target.value,
                                  })
                                }
                                rows={4}
                                className="mt-3 w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-white/82 outline-none placeholder:text-white/28"
                                placeholder="Step description"
                              />
                            </InputShell>

                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                              <InputShell>
                                <FieldLabel required>Question</FieldLabel>
                                <input
                                  value={step.question}
                                  onChange={(e) =>
                                    updateStep(stepIndex, { question: e.target.value })
                                  }
                                  className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                                  placeholder="Validation question"
                                />
                              </InputShell>

                              <InputShell>
                                <FieldLabel required>Expected answer</FieldLabel>
                                <input
                                  value={step.expected_answer}
                                  onChange={(e) =>
                                    updateStep(stepIndex, {
                                      expected_answer: e.target.value,
                                    })
                                  }
                                  className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                                  placeholder="Expected answer"
                                />
                              </InputShell>
                            </div>

                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                              <InputShell>
                                <FieldLabel>Validation type</FieldLabel>
                                <select
                                  value={step.validation_type}
                                  onChange={(e) =>
                                    updateStep(stepIndex, {
                                      validation_type: e.target
                                        .value as Step["validation_type"],
                                    })
                                  }
                                  className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none"
                                >
                                  <option value="exact_match" className="bg-[#0f172a]">
                                    exact match
                                  </option>
                                  <option value="contains" className="bg-[#0f172a]">
                                    contains
                                  </option>
                                  <option value="regex" className="bg-[#0f172a]">
                                    regex
                                  </option>
                                </select>
                                <FieldHint>
                                  Choose how learner answers should be validated.
                                </FieldHint>
                              </InputShell>

                              <InputShell>
                                <FieldLabel>Points</FieldLabel>
                                <input
                                  value={step.points}
                                  onChange={(e) =>
                                    updateStep(stepIndex, {
                                      points: Math.max(
                                        0,
                                        Number.parseInt(e.target.value || "0", 10),
                                      ),
                                    })
                                  }
                                  inputMode="numeric"
                                  type="number"
                                  min="1"
                                  step="1"
                                  className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none"
                                  placeholder="10"
                                />
                              </InputShell>

                              <InputShell className={isRegex ? "" : "opacity-55"}>
                                <FieldLabel required={isRegex}>
                                  Validation pattern
                                </FieldLabel>
                                <input
                                  value={step.validation_pattern ?? ""}
                                  onChange={(e) =>
                                    updateStep(stepIndex, {
                                      validation_pattern: e.target.value,
                                    })
                                  }
                                  disabled={!isRegex}
                                  className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28 disabled:cursor-not-allowed disabled:opacity-50"
                                  placeholder={
                                    isRegex ? "Regex pattern" : "Only used for regex"
                                  }
                                />
                                <FieldHint>
                                  Used only when the validation type is regex.
                                </FieldHint>
                              </InputShell>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <div className="text-[11px] uppercase tracking-wide text-white/50">
                                    Hints
                                  </div>
                                  <div className="mt-2 text-sm text-white/60">
                                    Optional guidance that can help the learner progress.
                                  </div>
                                </div>

                                <button
                                  onClick={() => addHint(stepIndex)}
                                  disabled={saving}
                                  className={`inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/82 transition hover:border-purple-400/30 hover:bg-white/5 ${
                                    saving ? "cursor-not-allowed opacity-60" : ""
                                  }`}
                                  type="button"
                                >
                                  <Plus className="h-4 w-4" />
                                  <span>Add hint</span>
                                </button>
                              </div>

                              <div className="mt-4 space-y-3">
                                {step.hints.length === 0 ? (
                                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-white/45">
                                    No hints added yet.
                                  </div>
                                ) : (
                                  step.hints.map((hint, hintIndex) => (
                                    <div
                                      key={hint.hint_id ?? `${stepIndex}-${hintIndex}`}
                                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                                    >
                                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
                                        <div className="min-w-0 flex-1">
                                          <div className="text-[11px] uppercase tracking-wide text-white/45">
                                            Hint {hint.hint_number}
                                          </div>

                                          <textarea
                                            value={hint.text}
                                            onChange={(e) =>
                                              updateHint(stepIndex, hintIndex, {
                                                text: e.target.value,
                                              })
                                            }
                                            rows={3}
                                            className="mt-3 w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-white/82 outline-none placeholder:text-white/28"
                                            placeholder={`Hint ${hintIndex + 1}`}
                                          />
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 xl:w-[180px]">
                                          <InputShell className="p-3">
                                            <FieldLabel>Cost</FieldLabel>
                                            <input
                                              value={hint.cost}
                                              onChange={(e) =>
                                                updateHint(stepIndex, hintIndex, {
                                                  cost: Math.max(
                                                    0,
                                                    Number.parseInt(
                                                      e.target.value || "0",
                                                      10,
                                                    ),
                                                  ),
                                                })
                                              }
                                              inputMode="numeric"
                                              type="number"
                                              min="0"
                                              step="1"
                                              className="mt-2 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none"
                                              placeholder="0"
                                            />
                                          </InputShell>

                                          <button
                                            onClick={() =>
                                              handleDeleteHint(stepIndex, hintIndex)
                                            }
                                            disabled={saving}
                                            className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-xs transition ${
                                              saving
                                                ? "cursor-not-allowed border-white/10 bg-black/20 text-white/28"
                                                : "border-red-400/20 bg-red-500/10 text-red-200 hover:border-red-400/30 hover:bg-red-500/15"
                                            }`}
                                            type="button"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            <span>Delete</span>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
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
                  <FieldLabel>Delivery</FieldLabel>
                  <select
                    value={form.lab_delivery}
                    onChange={(e) => handleChange("lab_delivery", e.target.value)}
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none"
                  >
                    <option value="terminal" className="bg-[#0f172a]">
                      terminal
                    </option>
                    <option value="web" className="bg-[#0f172a]">
                      web
                    </option>
                  </select>
                  <FieldHint>
                    Choose whether the learner experience is terminal-based or browser-based.
                  </FieldHint>
                </InputShell>

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
                  </InputShell>
                )}

                <InputShell>
                  <FieldLabel>Template path</FieldLabel>
                  <input
                    value={form.template_path}
                    onChange={(e) => handleChange("template_path", e.target.value)}
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                    placeholder="Template path"
                  />
                </InputShell>

                <InputShell>
                  <FieldLabel>Lab type</FieldLabel>
                  <input
                    value={form.lab_type}
                    onChange={(e) => handleChange("lab_type", e.target.value)}
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                    placeholder="Lab type"
                  />
                </InputShell>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/86">
                    {form.visibility === "public" ? (
                      <Globe className="h-4 w-4 text-emerald-300" />
                    ) : (
                      <Lock className="h-4 w-4 text-white/55" />
                    )}
                    <span>{form.visibility === "public" ? "Public lab" : "Private lab"}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/58">
                    {form.lab_delivery === "web" ? (
                      <>
                        This lab uses a browser-based runtime
                        {form.app_port.trim() ? ` on port ${form.app_port.trim()}` : ""}.
                      </>
                    ) : (
                      "This lab uses a terminal-based runtime."
                    )}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-white/46">
                    <TerminalSquare className="h-3.5 w-3.5" />
                    <span>{form.lab_delivery === "web" ? "Web delivery" : "Terminal delivery"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-white/50">
                      Lab files
                    </div>
                    <div className="mt-2 text-sm text-white/62">
                      Browse the lab root and upload/delete files in the current folder.
                    </div>
                  </div>

                  <div className="text-xs text-white/50">
                    {labFiles.length} file{labFiles.length > 1 ? "s" : ""}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => loadLabFiles()}
                    disabled={filesRefreshing || filesUploading || Boolean(deletingFilePath)}
                    className={`inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/80 transition hover:border-white/15 hover:bg-white/5 ${
                      filesRefreshing ? "cursor-not-allowed opacity-60" : ""
                    }`}
                    type="button"
                  >
                    {filesRefreshing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCcw className="h-3.5 w-3.5" />
                    )}
                    <span>Refresh</span>
                  </button>

                  <button
                    onClick={openUploadDialog}
                    disabled={filesUploading || Boolean(deletingFilePath)}
                    className={`inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/80 transition hover:border-sky-400/30 hover:bg-white/5 ${
                      filesUploading ? "cursor-not-allowed opacity-60" : ""
                    }`}
                    type="button"
                  >
                    {filesUploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    <span>Add file here</span>
                  </button>

                  <button
                    onClick={() =>
                      setCurrentFolder((prev) => {
                        if (!prev) return "";
                        const index = prev.lastIndexOf("/");
                        return index === -1 ? "" : prev.slice(0, index);
                      })
                    }
                    disabled={!currentFolder}
                    className={`inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/80 transition hover:border-white/15 hover:bg-white/5 ${
                      !currentFolder ? "cursor-not-allowed opacity-40" : ""
                    }`}
                    type="button"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Up</span>
                  </button>

                  <input
                    ref={uploadInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleUploadFile}
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-white/64">
                    <button
                      onClick={() => setCurrentFolder("")}
                      className={`rounded-lg border px-2 py-1 transition ${
                        currentFolder
                          ? "border-white/10 bg-white/[0.03] text-white/75 hover:border-white/20"
                          : "border-sky-400/30 bg-sky-500/10 text-sky-200"
                      }`}
                      type="button"
                    >
                      root
                    </button>

                    {folderSegments.map((segment, index) => {
                      const targetFolder = folderSegments
                        .slice(0, index + 1)
                        .join("/");
                      const isCurrent = targetFolder === currentFolder;

                      return (
                        <button
                          key={targetFolder}
                          onClick={() => setCurrentFolder(targetFolder)}
                          className={`rounded-lg border px-2 py-1 transition ${
                            isCurrent
                              ? "border-sky-400/30 bg-sky-500/10 text-sky-200"
                              : "border-white/10 bg-white/[0.03] text-white/75 hover:border-white/20"
                          }`}
                          type="button"
                        >
                          {segment}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="text-xs text-white/52">
                  Current folder: <span className="text-white/82">{currentFolder || "/"}</span>
                  {" · "}
                  Total size: <span className="text-white/82">{formatBytes(totalFileSize)}</span>
                </div>

                {filesError && (
                  <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                    {filesError}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="text-[11px] uppercase tracking-wide text-white/45">
                      Folders
                    </div>
                    <div className="mt-2 space-y-2">
                      {filesLoading ? (
                        <div className="text-xs text-white/50">Loading files…</div>
                      ) : folderEntries.directories.length === 0 ? (
                        <div className="text-xs text-white/45">No subfolder in this folder.</div>
                      ) : (
                        folderEntries.directories.map((dirName) => {
                          const target = currentFolder
                            ? `${currentFolder}/${dirName}`
                            : dirName;
                          return (
                            <button
                              key={target}
                              onClick={() => setCurrentFolder(target)}
                              className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-xs text-white/82 transition hover:border-white/20 hover:bg-white/[0.05]"
                              type="button"
                            >
                              <Folder className="h-3.5 w-3.5 text-sky-300" />
                              <span>{dirName}</span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="text-[11px] uppercase tracking-wide text-white/45">
                      Files
                    </div>
                    <div className="mt-2 space-y-2">
                      {filesLoading ? (
                        <div className="text-xs text-white/50">Loading files…</div>
                      ) : folderEntries.files.length === 0 ? (
                        <div className="text-xs text-white/45">
                          No file in this folder.
                        </div>
                      ) : (
                        folderEntries.files.map((file) => {
                          const fileName = file.path.split("/").pop() || file.path;
                          const isPreviewed = previewPath === file.path;
                          const deleting = deletingFilePath === file.path;

                          return (
                            <div
                              key={file.path}
                              className={`rounded-xl border px-3 py-2 ${
                                isPreviewed
                                  ? "border-sky-400/25 bg-sky-500/10"
                                  : "border-white/10 bg-white/[0.03]"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <button
                                  onClick={() => handlePreviewFile(file.path)}
                                  className="min-w-0 text-left"
                                  type="button"
                                >
                                  <div className="flex items-center gap-2 text-xs text-white/86">
                                    <FileText className="h-3.5 w-3.5 text-sky-300" />
                                    <span className="truncate">{fileName}</span>
                                  </div>
                                  <div className="mt-1 text-[11px] text-white/48">
                                    {formatBytes(file.size)}
                                  </div>
                                </button>

                                <button
                                  onClick={() => handleDeleteFile(file.path)}
                                  disabled={deleting}
                                  className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] transition ${
                                    deleting
                                      ? "cursor-not-allowed border-white/10 bg-black/20 text-white/35"
                                      : "border-red-400/20 bg-red-500/10 text-red-200 hover:border-red-400/30 hover:bg-red-500/15"
                                  }`}
                                  type="button"
                                >
                                  {deleting ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3 w-3" />
                                  )}
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-white/45">
                    Preview
                  </div>

                  {previewPath ? (
                    <div className="mt-2">
                      <div className="text-xs text-white/60">{previewPath}</div>
                      {previewLoading ? (
                        <div className="mt-3 inline-flex items-center gap-2 text-xs text-white/55">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Loading preview…</span>
                        </div>
                      ) : previewError ? (
                        <div className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                          {previewError}
                        </div>
                      ) : (
                        <pre className="mt-3 max-h-56 overflow-auto rounded-xl border border-white/10 bg-black/30 p-3 text-[11px] leading-relaxed text-white/80">
                          {previewContent || "Empty file"}
                        </pre>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-white/45">
                      Select a file to preview its text content.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Navigation
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white/86">
                      Step overview
                    </div>
                    <div className="text-xs text-white/50">
                      {incompleteSteps} incomplete
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {steps.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/45">
                        No steps yet.
                      </div>
                    ) : (
                      steps.map((step, index) => {
                        const isOpen = expandedSteps[index] ?? false;
                        const isIncomplete =
                          !step.title.trim() ||
                          !step.description.trim() ||
                          !step.question.trim() ||
                          !step.expected_answer.trim() ||
                          !Number.isFinite(step.points) ||
                          step.points <= 0 ||
                          (step.validation_type === "regex" &&
                            !(step.validation_pattern ?? "").trim()) ||
                          step.hints.some(
                            (hint) =>
                              !hint.text.trim() ||
                              !Number.isFinite(hint.cost) ||
                              hint.cost < 0,
                          );

                        return (
                          <button
                            key={`nav-${step.step_id ?? index}`}
                            onClick={() => openOnlyStep(index)}
                            className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                              isOpen
                                ? "border-sky-400/30 bg-white/[0.06]"
                                : "border-white/10 bg-black/20 hover:border-white/15 hover:bg-white/[0.04]"
                            }`}
                            type="button"
                          >
                            <div className="min-w-0">
                              <div className="text-[11px] uppercase tracking-wide text-white/45">
                                Step {step.step_number}
                              </div>
                              <div className="mt-1 truncate text-sm text-white/84">
                                {step.title.trim() || `Untitled step ${step.step_number}`}
                              </div>
                            </div>

                            <div
                              className={`shrink-0 rounded-full border px-2 py-1 text-[10px] uppercase tracking-wide ${
                                isIncomplete
                                  ? "border-amber-400/20 bg-amber-500/10 text-amber-200"
                                  : "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                              }`}
                            >
                              {isIncomplete ? "Incomplete" : "Ready"}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/86">
                    <Search className="h-4 w-4 text-sky-300" />
                    Validation guidance
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/58">
                    Use exact match for strict answers, contains for broader checks,
                    and regex only when pattern matching is necessary.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/58">
                    Each step should define one objective, one validation prompt, and
                    one expected answer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
