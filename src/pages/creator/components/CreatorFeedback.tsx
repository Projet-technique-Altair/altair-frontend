// src/pages/creator/components/CreatorFeedback.tsx

/**
 * @file Creator Feedback — section showing recent learner feedback for labs and starpaths.
 *
 * @remarks
 * This component is part of the **Altair Creator Dashboard** and displays a
 * summarized list of the most recent feedback items left by learners on the
 * creator’s content.
 *
 * Each feedback includes:
 * - The learner’s name and message.
 * - The corresponding lab or starpath title.
 * - A numerical rating.
 *
 * Clicking on a feedback entry redirects the creator to the detailed analytics
 * page for the related lab or starpath.
 *
 * @packageDocumentation
 */
import { useNavigate } from "react-router-dom";
import DashboardCard from "@/components/ui/DashboardCard";


/**
 * Structure describing a feedback entry submitted by a learner.
 *
 * @property id - Unique identifier for the feedback entry.
 * @property user - Username or display name of the learner who provided feedback.
 * @property message - The actual feedback message text.
 * @property rating - Numerical rating from 1 to 5.
 * @property targetId - Identifier of the lab or starpath associated with this feedback.
 * @property targetType - Type of content (`"lab"` or `"starpath"`).
 * @property targetTitle - Title of the referenced lab or starpath.
 *
 * @public
 */
export interface Feedback {
  id: string;
  user: string;
  message: string;
  rating: number;
  targetId: string; // lab or starpath ID
  targetType: "lab" | "starpath";
  targetTitle: string;
}


/**
 * Displays the most recent feedback from learners on a creator’s labs or starpaths.
 *
 * @remarks
 * - Each entry is clickable, linking to the detailed analytics view of the target item.
 * - Currently uses mock data; in production, feedbacks would be fetched from the backend.
 * - Styled consistently with the rest of the Creator Dashboard cards.
 *
 * @returns React component rendering a feedback summary list.
 *
 * @public
 */
export default function CreatorFeedback() {
  const navigate = useNavigate();

  // === MOCK DATA ===
  const feedbacks: Feedback[] = [
    {
      id: "f1",
      user: "Alice",
      message: "Excellent explanations, very engaging content.",
      rating: 5,
      targetId: "lab1",
      targetType: "lab",
      targetTitle: "Linux Forensics Fundamentals",
    },
    {
      id: "f2",
      user: "Marc",
      message: "The flow of the Starpath was great but maybe too long.",
      rating: 4,
      targetId: "sp1",
      targetType: "starpath",
      targetTitle: "Cyber Defense Essentials",
    },
    {
      id: "f3",
      user: "Nina",
      message: "Loved the challenge! Perfect difficulty.",
      rating: 5,
      targetId: "lab2",
      targetType: "lab",
      targetTitle: "Privilege Escalation Challenge",
    },
  ];

  return (
    <DashboardCard className="p-6 space-y-4">
      <h2 className="text-lg font-semibold text-purple-400">
        Recent Feedback
      </h2>

      {feedbacks.map((f) => (
        <div
          key={f.id}
          className="border-b border-white/10 pb-3 last:border-none cursor-pointer group"
          onClick={() =>
            navigate(
              f.targetType === "lab"
                ? `/creator/lab/${f.targetId}`
                : `/creator/starpath/${f.targetId}`
            )
          }
        >
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm text-white group-hover:text-sky-400 transition">
              <span className="text-sky-400 font-medium">{f.user}</span> —{" "}
              {f.message}
            </p>
            <span className="text-xs text-gray-400 ml-3">
              ⭐ {f.rating}
            </span>
          </div>

          <p className="text-xs text-gray-500">
            {f.targetType === "lab" ? "Lab" : "Starpath"}:{" "}
            <span className="text-white/80 group-hover:text-sky-400 transition">
              {f.targetTitle}
            </span>
          </p>
        </div>
      ))}
    </DashboardCard>
  );
}
