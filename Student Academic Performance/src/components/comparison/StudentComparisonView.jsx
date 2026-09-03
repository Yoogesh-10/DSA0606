import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateOverallScore, calculateRiskScore, getRiskCategory } from '../../utils/dataScience';
import { GitCompare, Users, Plus, X, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

export const StudentComparisonView = () => {
  const { dataset, riskWeights } = useApp();

  const [selectedIds, setSelectedIds] = useState([
    dataset[0]?.Student_ID || 'STU2025001',
    dataset[1]?.Student_ID || 'STU2025002',
    dataset[2]?.Student_ID || 'STU2025003'
  ]);

  const selectedStudents = useMemo(() => {
    return selectedIds.map(id => dataset.find(s => s.Student_ID === id)).filter(Boolean);
  }, [dataset, selectedIds]);

  const handleSelectStudent = (idx, id) => {
    setSelectedIds(prev => {
      const next = [...prev];
      next[idx] = id;
      return next;
    });
  };

  const addStudent = () => {
    if (selectedIds.length < 4) {
      const unselected = dataset.find(s => !selectedIds.includes(s.Student_ID));
      if (unselected) {
        setSelectedIds(prev => [...prev, unselected.Student_ID]);
      }
    }
  };

  const removeStudent = (idx) => {
    if (selectedIds.length > 2) {
      setSelectedIds(prev => prev.filter((_, i) => i !== idx));
    }
  };

  // Bar Chart Data (Metrics on X-axis, bar per student)
  const barChartData = useMemo(() => {
    const metrics = [
      { key: 'att', label: 'Attendance %' },
      { key: 'internal', label: 'Internal Marks' },
      { key: 'assign', label: 'Assignment Score' },
      { key: 'prev', label: 'Prev Semester' },
      { key: 'curr', label: 'Curr Semester' },
      { key: 'overall', label: 'Overall Score' }
    ];

    return metrics.map(m => {
      const row = { metric: m.label };
      selectedStudents.forEach((st, idx) => {
        let val = 0;
        if (m.key === 'att') val = Number(st.Attendance) || 0;
        else if (m.key === 'internal') val = Number(st.Internal_Marks) || 0;
        else if (m.key === 'assign') val = Number(st.Assignment_Score) || 0;
        else if (m.key === 'prev') val = Number(st.Previous_Semester_Marks) || 0;
        else if (m.key === 'curr') val = Number(st.Current_Semester_Marks) || 0;
        else if (m.key === 'overall') val = calculateOverallScore(st);

        row[st.Student_Name] = val;
      });
      return row;
    });
  }, [selectedStudents]);

  const colors = ['#0c8de4', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <GitCompare className="w-5 h-5 text-brand-600" />
              <span>Multi-Student Comparative Analysis</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select 2 to 4 students to compare academic performance indicators head-to-head.
            </p>
          </div>

          {selectedIds.length < 4 && (
            <button
              onClick={addStudent}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add 4th Student</span>
            </button>
          )}
        </div>

        {/* Student Selectors Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {selectedIds.map((id, idx) => (
            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Student #{idx + 1}</span>
                {selectedIds.length > 2 && (
                  <button
                    onClick={() => removeStudent(idx)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <select
                value={id}
                onChange={(e) => handleSelectStudent(idx, e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
              >
                {dataset.map(s => (
                  <option key={s.Student_ID} value={s.Student_ID}>
                    {s.Student_Name} ({s.Student_ID})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-Side Metric Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {selectedStudents.map((st, idx) => {
          const overall = calculateOverallScore(st);
          const risk = calculateRiskScore(st, riskWeights);
          const riskCat = getRiskCategory(risk);
          return (
            <div key={st.Student_ID} className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm"
                  style={{ backgroundColor: colors[idx % colors.length] }}
                >
                  {st.Student_Name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{st.Student_Name}</h4>
                  <p className="text-[10px] text-slate-400">{st.Student_ID} • {st.Department}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800 pt-2">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Overall Score:</span>
                  <span className="font-black text-slate-900 dark:text-white">{overall}%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Attendance:</span>
                  <span className="font-bold">{st.Attendance}%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Internal Marks:</span>
                  <span className="font-bold">{st.Internal_Marks}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Assignment:</span>
                  <span className="font-bold">{st.Assignment_Score}</span>
                </div>
                <div className="flex justify-between py-1 items-center">
                  <span className="text-slate-500">Risk Score:</span>
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${riskCat.badgeColor}`}>
                    {riskCat.category} ({risk})
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grouped Bar Chart Visual Comparison */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Head-to-Head Grouped Metric Comparison</h4>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#94a3b8" />
              <XAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
              <Legend />
              {selectedStudents.map((st, idx) => (
                <Bar key={st.Student_ID} dataKey={st.Student_Name} fill={colors[idx % colors.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
