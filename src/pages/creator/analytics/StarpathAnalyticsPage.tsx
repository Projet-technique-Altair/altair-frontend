/**
 * @file Starpath Analytics Page — performance dashboard for a specific learning path.
 *
 * @remarks
 * This component provides an analytical overview for a given Starpath (learning path)
 * within the Altair Creator Dashboard. It visualizes student progress and summarizes
 * key metrics such as:
 *
 * - Total number of labs included
 * - Number of learners enrolled
 * - Average rating
 * - Completion rates per lab (bar chart)
 *
 * The visualization is powered by Recharts and uses mock data for demonstration.
 *
 * @packageDocumentation
 */

import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import DashboardCard from "@/components/ui/DashboardCard";


/**
 * Page component that displays analytics and performance insights
 * for a specific Starpath (creator-defined learning path).
 *
 * @remarks
 * - Retrieves the Starpath ID from the URL.
 * - Displays aggregate statistics (lab count, learners, rating).
 * - Renders a bar chart showing completion percentage per lab.
 * - Allows quick navigation back to the Creator Dashboard.
 *
 * @returns React component representing the Starpath Analytics page.
 *
 * @public
 */
export default function StarpathAnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // === MOCK DATA ===
  const starpath = {
    id,
    title: "Cyber Defense Essentials",
    createdAt: "2025-10-10",
    labsCount: 3,
    learners: 58,
    avgRating: 4.8,
  };

  const labProgressData = [
    { lab: "Security Introduction", completion: 95 },
    { lab: "Network Defense", completion: 82 },
    { lab: "Forensics Analysis", completion: 76 },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white px-8 py-10 space-y-10">
      {/* === BACK BUTTON === */}
      <button
        onClick={() => navigate("/creator/dashboard")}
        className="flex items-center text-gray-300 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
      </button>

      {/* === PAGE TITLE === */}
      <h1 className="text-3xl font-bold text-sky-400">
        Analytics – {starpath.title}
      </h1>

      {/* === METRICS GRID === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard className="p-6 text-center">
          <h3 className="text-gray-400">Included Labs</h3>
          <p className="text-2xl font-bold text-white mt-1">
            {starpath.labsCount}
          </p>
        </DashboardCard>

        <DashboardCard className="p-6 text-center">
          <h3 className="text-gray-400">Learners</h3>
          <p className="text-2xl font-bold text-white mt-1">
            {starpath.learners}
          </p>
        </DashboardCard>

        <DashboardCard className="p-6 text-center">
          <h3 className="text-gray-400">Average Rating</h3>
          <p className="text-2xl font-bold text-white mt-1">
            {starpath.avgRating}
          </p>
        </DashboardCard>
      </div>

      {/* === GRAPH === */}
      <DashboardCard className="p-6">
        <h2 className="text-lg font-semibold text-sky-400 mb-4">
          Completion Rate per Lab
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={labProgressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="lab" stroke="#a0aec0" />
            <YAxis stroke="#a0aec0" />
            <Tooltip contentStyle={{ background: "#1a202c", border: "none" }} />
            <Bar dataKey="completion" fill="#38bdf8" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </DashboardCard>
    </div>
  );
}
