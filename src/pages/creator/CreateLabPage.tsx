// src/pages/creator/CreateLabPage.tsx

/**
 * @file Create Lab Page — AI-assisted lab creation flow.
 *
 * @remarks
 * This page orchestrates the **AI-driven lab generation pipeline** within the
 * Altair Creator Dashboard. It integrates multiple subcomponents to guide the
 * creator from prompt definition to final validation:
 *
 * 1. **AI-Prof** interprets learning objectives and metadata.
 * 2. **AI-Builder** generates the initial lab draft.
 * 3. The creator can **review**, **edit manually**, or **approve** the draft.
 * 4. **AI-Final Validation** confirms the lab’s readiness before saving it.
 *
 * The flow is sequential, managed through a step state machine.
 * Transitions simulate asynchronous AI generation (mocked with timeouts).
 *
 * @packageDocumentation
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import DashboardCard from "@/components/ui/DashboardCard";
import { ALT_COLORS } from "@/lib/theme";

import LabPromptForm from "./components/LabPromptForm";
import AIGenerationModal from "./components/AIGenerationModal";
import AIBuilderPreview from "./components/AIBuilderPreview";
import AIFinalValidation from "./components/AIFinalValidation";
import ManualEditPage from "./components/ManualEditPage"; 


/**
 * Enumeration of the possible creation steps within the AI-assisted workflow.
 *
 * - `prompt` → user defines objectives and metadata.
 * - `ai-prof` → AI-Prof analyses the prompt and context.
 * - `ai-builder` → AI-Builder generates lab structure and content.
 * - `review` → creator reviews the generated draft.
 * - `manual-edit` → optional manual editing before validation.
 * - `final` → AI-Prof validation screen before saving.
 * - `done` → final redirect to dashboard.
 *
 * @public
 */
type CreationStep =
  | "prompt"
  | "ai-prof"
  | "ai-builder"
  | "review"
  | "manual-edit" 
  | "final"
  | "done";


  /**
 * Displays the full **AI-assisted lab creation flow** for creators.
 *
 * @remarks
 * - Central orchestrator for subcomponents like {@link LabPromptForm},
 *   {@link AIGenerationModal}, {@link AIBuilderPreview},
 *   {@link ManualEditPage}, and {@link AIFinalValidation}.
 * - Handles internal navigation between steps via a finite state machine.
 * - Uses mock delays (`setTimeout`) to simulate asynchronous AI responses.
 * - On completion, redirects the user back to `/creator/dashboard`.
 *
 * @returns The complete creation interface wrapped in Altair's dashboard layout.
 *
 * @example
 * ```tsx
 * // Inside a Creator Dashboard route
 * <Route path="/creator/create-lab" element={<CreateLabPage />} />
 * ```
 *
 * @public
 */
export default function CreateLabPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<CreationStep>("prompt");
  const [promptData, setPromptData] = useState<{
    title: string;
    goal: string;
    level: string;
    tags: string[];
  } | null>(null);

  const [generatedLab, setGeneratedLab] = useState<any | null>(null);


  /**
   * Simulates transitions between AI-Prof and AI-Builder phases.
   * Each phase triggers a timeout to emulate API response delay.
   */
  useEffect(() => {
    if (step === "ai-prof") {
      const t = setTimeout(() => setStep("ai-builder"), 2000);
      return () => clearTimeout(t);
    }
    if (step === "ai-builder") {
      const fakeLab = {
        title: promptData?.title || "Linux security audit",
        environment: "Ubuntu 22.04 (container)",
        duration: "45 min",
        level: promptData?.level || "Intermediate",
        steps: [
          {
            id: "s1",
            title: "Identify running services",
            instruction: "Run `ss -tulnp` to list services and detect exposed ports.",
            expected: "ss -tulnp",
          },
          {
            id: "s2",
            title: "Check sudoers",
            instruction: "Inspect /etc/sudoers and detect misconfigurations.",
            expected: "sudo -l",
          },
          {
            id: "s3",
            title: "Report",
            instruction: "Prepare a short report describing the misconfig.",
            expected: "report.md",
          },
        ],
      };
      setGeneratedLab(fakeLab);
      const t = setTimeout(() => setStep("review"), 1800);
      return () => clearTimeout(t);
    }
  }, [step, promptData]);

  const handlePromptSubmit = (data: {
    title: string;
    goal: string;
    level: string;
    tags: string[];
  }) => {
    setPromptData(data);
    setStep("ai-prof");
  };

  const handleCreatorApprove = () => setStep("final");
  const handleManualEdit = () => setStep("manual-edit"); // ✅ new
  const handleFinalApprove = () => {
    setStep("done");
    navigate("/creator/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white px-8 py-10 space-y-8">
      <div className="flex items-center justify-between gap-4">
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
            Assisted flow: AI-Prof → AI-Builder → your validation → private lab.
          </p>
        </div>

        <button
          onClick={() => navigate("/creator/dashboard")}
          className="text-sm text-slate-300 hover:text-white transition"
        >
          ← Back to creator dashboard
        </button>
      </div>

      {step === "prompt" && (
        <DashboardCard className="p-6">
          <LabPromptForm onSubmit={handlePromptSubmit} />
        </DashboardCard>
      )}

      {(step === "ai-prof" || step === "ai-builder") && (
        <AIGenerationModal
          phase={step === "ai-prof" ? "ai-prof" : "ai-builder"}
          title={promptData?.title}
        />
      )}

      {step === "review" && generatedLab && (
        <AIBuilderPreview
          lab={generatedLab}
          onApprove={handleCreatorApprove}
          onBack={() => setStep("prompt")}
          onManualEdit={handleManualEdit} // ✅
        />
      )}

      {step === "manual-edit" && generatedLab && (
        <ManualEditPage
          lab={generatedLab}
          onSave={(updated) => {
            setGeneratedLab(updated);
            setStep("review");
          }}
          onCancel={() => setStep("review")}
        />
      )}

      {step === "final" && (
        <AIFinalValidation
          labTitle={generatedLab?.title ?? "New lab"}
          onFinish={handleFinalApprove}
        />
      )}
    </div>
  );
}
