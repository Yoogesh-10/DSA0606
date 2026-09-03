import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { performSegmentation, calculateOverallScore } from '../../utils/dataScience';
import { PieChart as PieIcon, Users, ArrowRight, Eye } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis } from 'recharts';

export const StudentSegmentationView = () => {
  const { filteredDataset, riskWeights, openStudentProfile } = useApp();

  const [activeSegment, setActiveSegment] = useState('High Performers');

  // Perform cohort clustering
  const segments = useMemo(() => {
    return performSegmentation(filteredDataset, riskWeights);
  }, [filteredDataset, riskWeights]);

  const segmentColors = {
    "High Performers": { bg: "bg-emerald-50 text-emerald-800 border-emerald-300", badge: "bg-emerald-500 text-white", chart: "#10b981" },
    "Consistent Performers": { bg: "bg-blue-50 text-blue-800 border-blue-300", badge: "bg-blue-500 text-white", chart: "#3b82f6" },
    "Attendance Risk": { bg: "bg-amber-50 text-amber-800 border-amber-300", badge: "bg-amber-500 text-white", chart: "#f59e0b" },
    "Assignment Risk": { bg: "bg-purple-50 text-purple-800 border-purple-300", badge: "bg-purple-500 text-white", chart: "#a855f7" },
    "Improving Students": { bg: "bg-teal-50 text-teal-800 border-teal-300", badge: "bg-teal-500 text-white", chart: "#14b8a6" },
    "Declining Students": { bg: "bg-orange-50 text-orange-800 border-orange-300", badge: "bg-orange-500 text-white", chart: "#f97316" },
    "Critical Support Group": { bg: "bg-red-50 text-red-800 border-red-300", badge: "bg-red-500 text-white", chart: "#ef4444" }
  };

  // Prepare Scatter data grouped by segment
  const scatterData = useMemo(() => {
    const list = [];
    Object.keys(segments).forEach(segName => {
      segments[segName].forEach(s => {
        list.push({
          id: s.Student_ID,
          name: s.Student_Name,
          dept: s.Department,
          attendance: Number(s.Attendance) || 0,
          overall: calculateOverallScore(s),
          segment: segName,
          fill: segmentColors[segName]?.chart || "#6366f1"
        });
      });
    });
    return list;
  }, [segments]);

  const activeRoster = segments[activeSegment] || [];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
          <PieIcon className="w-5 h-5 text-brand-600" />
          <span>Rule-Based Student Cohort Segmentation</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Students grouped into 7 behavioral and performance clusters for tailored institutional strategies.
        </p>
      </div>

      {/* Segment Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.keys(segments).map((segName) => {
          const count = segments[segName].length;
          const isSelected = activeSegment === segName;
          const style = segmentColors[segName];
          return (
            <div
              key={segName}
              onClick={() => setActiveSegment(segName)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-500 shadow-md ring-2 ring-brand-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-brand-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{segName}</span>
                <span className={`px-2 py-0.5 text-xs font-black rounded-full ${style.badge}`}>
                  {count}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {count > 0 ? `${count} students assigned to this cohort.` : 'No students in this cohort.'}
              </p>
            </div>
          );
        })}
      </div>

      {/* 2D Segment Scatter Visualization */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Cohort Cluster Scatter Distribution</h4>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#94a3b8" />
              <XAxis type="number" dataKey="attendance" name="Attendance %" stroke="#94a3b8" fontSize={11} domain={[30, 100]} />
              <YAxis type="number" dataKey="overall" name="Overall Score %" stroke="#94a3b8" fontSize={11} domain={[30, 100]} />
              <ZAxis type="number" range={[50, 50]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl space-y-1">
                        <p className="font-bold">{d.name} ({d.id})</p>
                        <p className="text-slate-300">Cohort: <span className="font-bold text-amber-400">{d.segment}</span></p>
                        <p className="text-slate-300">Attendance: {d.attendance}% | Score: {d.overall}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Students" data={scatterData}>
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segment Roster Drill-Down Table */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
            Cohort Roster: <span className="text-brand-600">{activeSegment}</span> ({activeRoster.length} Students)
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold uppercase">
              <tr>
                <th className="p-3.5">Student ID</th>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5 text-right">Attendance</th>
                <th className="p-3.5 text-right">Internal Marks</th>
                <th className="p-3.5 text-right">Assignment Score</th>
                <th className="p-3.5 text-right">Overall Score</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {activeRoster.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-slate-400">
                    No students currently meet the criteria for this segment.
                  </td>
                </tr>
              ) : (
                activeRoster.map(s => (
                  <tr key={s.Student_ID} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3.5 font-bold text-brand-600">{s.Student_ID}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{s.Student_Name}</td>
                    <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">{s.Department}</td>
                    <td className="p-3.5 text-right font-bold">{s.Attendance}%</td>
                    <td className="p-3.5 text-right">{s.Internal_Marks}</td>
                    <td className="p-3.5 text-right">{s.Assignment_Score}</td>
                    <td className="p-3.5 text-right font-black text-slate-900 dark:text-white">{calculateOverallScore(s)}%</td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => openStudentProfile(s)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
