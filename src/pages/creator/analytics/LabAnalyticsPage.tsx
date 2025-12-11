/**
 * @file Lab Analytics Page — detailed performance view for a specific lab.
 *
 * @remarks
 * This component displays analytical metrics for a single lab within the Altair
 * Creator Dashboard. It summarizes key indicators such as:
 *
 * - Total number of views
 * - Average user rating
 * - Completion rate
 * - View growth over time (chart)
 *
 * The chart is powered by Recharts and uses mock data for visualization.
 * Intended for internal analytics, performance review, and course optimization.
 *
 * @packageDocumentation
 */

import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardCard from "@/components/ui/DashboardCard";


/**
 * Page component displaying analytical metrics and visual insights for a lab.
 *
 * @remarks
 * - Retrieves the lab ID from URL parameters.
 * - Renders summary metrics (views, rating, completion rate).
 * - Displays a line chart showing view progression over time.
 * - Provides navigation back to the Creator Dashboard.
 *
 * @returns React component representing the Lab Analytics view.
 *
 * @public
 */
export default function LabAnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // === MOCK DATA ===
  const lab = {
    id,
    title: "Linux Forensics Fundamentals",
    createdAt: "2025-09-20",
    visibility: "public",
    rating: 4.6,
    views: 320,
    completions: 210,
  };

  const viewsData = [
    { date: "Oct 01", views: 20 },
    { date: "Oct 05", views: 45 },
    { date: "Oct 10", views: 80 },
    { date: "Oct 15", views: 130 },
    { date: "Oct 20", views: 210 },
    { date: "Oct 25", views: 320 },
  ];

  const completionRate = ((lab.completions / lab.views) * 100).toFixed(1);

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
      <h1 className="text-3xl font-bold text-purple-400">
        Analytics – {lab.title}
      </h1>

      {/* === METRICS GRID === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard className="p-6 text-center">
          <h3 className="text-gray-400">Total Views</h3>
          <p className="text-2xl font-bold text-white mt-1">{lab.views}</p>
        </DashboardCard>

        <DashboardCard className="p-6 text-center">
          <h3 className="text-gray-400">Average Rating</h3>
          <p className="text-2xl font-bold text-white mt-1">{lab.rating}</p>
        </DashboardCard>

        <DashboardCard className="p-6 text-center">
          <h3 className="text-gray-400">Completion Rate</h3>
          <p className="text-2xl font-bold text-white mt-1">{completionRate}%</p>
        </DashboardCard>
      </div>

      {/* === GRAPH === */}
      <DashboardCard className="p-6">
        <h2 className="text-lg font-semibold text-purple-400 mb-4">
          Views Over Time
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={viewsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="date" stroke="#a0aec0" />
            <YAxis stroke="#a0aec0" />
            <Tooltip contentStyle={{ background: "#1a202c", border: "none" }} />
            <Line
              type="monotone"
              dataKey="views"
              stroke="#a855f7"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </DashboardCard>
    </div>
  );
}
