import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  calculateRiskScore,
  getRiskCategory,
  DEFAULT_RISK_WEIGHTS
} from '../../utils/dataScience';
import {
  AlertTriangle,
  Sliders,
  HeartHandshake,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Eye
} from 'lucide-react';

export const AtRiskStudentsView = () => {
  const {
    filteredDataset,
    riskWeights,
    setRiskWeights,
    openStudentProfile,
    addIntervention,
    setActiveTab
  } = useApp();

  // Compute at-risk students roster sorted by risk score
  const atRiskRoster = useMemo(() => {
    return filteredDataset
      .map(student => {
        const score = calculateRiskScore(student, riskWeights);
        const info = getRiskCategory(score);

        // Determine main contributing factor
        const att = Math.max(0, Math.min(100, Number(student.Attendance) || 0));
        const assign = Math.max(0, Math.min(100, Number(student.Assignment_Score) || 0));
        const internal = Math.max(0, Math.min(100, Number(student.Internal_Marks) || 0));
        const prev = Math.max(0, Math.min(100, Number(student.Previous_Semester_Marks) || 0));
        const curr = Math.max(0, Math.min(100, Number(student.Current_Semester_Marks) || 0));

        let mainFactor = "Balanced academic decline";
        let recAction = "General Mentoring";

        if (att < 70) {
          mainFactor = `Attendance Deficit (${att}%)`;
          recAction = "Attendance Counseling";
        } else if (assign < 60) {
          mainFactor = `Low Assignment Completion (${assign}%)`;
          recAction = "Assignment Support Plan";
        } else if (internal < 60) {
          mainFactor = `Internal Assessment Deficit (${internal}/100)`;
          recAction = "Subject Remedial Tutorials";
        } else if (prev - curr >= 5) {
          mainFactor = `Declining Performance Trajectory (-${prev - curr}%)`;
          recAction = "Academic Counseling";
        }

        return {
          ...student,
          riskScore: score,
          category: info.category,
          badgeColor: info.badgeColor,
          mainFactor,
          recAction
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [filteredDataset, riskWeights]);

  const handleWeightChange = (factor, val) => {
    setRiskWeights(prev => ({
      ...prev,
      [factor]: Number(val)
    }));
  };

  const handleQuickIntervention = (student) => {
    const newInt = {
      id: `INT-${Date.now()}`,
      studentId: student.Student_ID,
      studentName: student.Student_Name,
      department: student.Department,
      riskScore: student.riskScore,
      mainFactor: student.mainFactor,
      recommendedAction: student.recAction,
      assignedFaculty: "Department HOD",
      priority: student.riskScore >= 80 ? "Critical" : "High",
      status: "Pending",
      assignedDate: new Date().toISOString().split('T')[0],
      notes: "Assigned directly from Risk Detection Engine."
    };
    addIntervention(newInt);
    setActiveTab('interventions');
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Configurable Factors Control Bar */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-brand-600" />
              <span>Risk Engine Weight Configuration</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Adjust individual factor weights to fine-tune institutional risk calculations in real time.
            </p>
          </div>

          <button
            onClick={() => setRiskWeights(DEFAULT_RISK_WEIGHTS)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Weights to Default</span>
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
          {/* Attendance Weight */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
              <span>Attendance Weight</span>
              <span className="text-brand-600 dark:text-brand-400">{riskWeights.attendance}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={riskWeights.attendance}
              onChange={(e) => handleWeightChange('attendance', e.target.value)}
              className="w-full accent-brand-600"
            />
          </div>

          {/* Internal Marks Weight */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
              <span>Internal Marks</span>
              <span className="text-brand-600 dark:text-brand-400">{riskWeights.internalMarks}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={riskWeights.internalMarks}
              onChange={(e) => handleWeightChange('internalMarks', e.target.value)}
              className="w-full accent-brand-600"
            />
          </div>

          {/* Assignment Score Weight */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
              <span>Assignment Score</span>
              <span className="text-brand-600 dark:text-brand-400">{riskWeights.assignmentScore}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={riskWeights.assignmentScore}
              onChange={(e) => handleWeightChange('assignmentScore', e.target.value)}
              className="w-full accent-brand-600"
            />
          </div>

          {/* Previous Performance Weight */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
              <span>Prev Semester</span>
              <span className="text-brand-600 dark:text-brand-400">{riskWeights.previousPerformance}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={riskWeights.previousPerformance}
              onChange={(e) => handleWeightChange('previousPerformance', e.target.value)}
              className="w-full accent-brand-600"
            />
          </div>

          {/* Performance Trend Weight */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
              <span>Trend Weight</span>
              <span className="text-brand-600 dark:text-brand-400">{riskWeights.performanceTrend}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={riskWeights.performanceTrend}
              onChange={(e) => handleWeightChange('performanceTrend', e.target.value)}
              className="w-full accent-brand-600"
            />
          </div>
        </div>
      </div>

      {/* Ranked Students Requiring Attention Roster */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <span>Ranked Students Requiring Priority Attention</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sorted by highest Risk Score (0–100 scale). Critical and High risk threshold students require immediate intervention.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold uppercase">
              <tr>
                <th className="p-3.5">Rank</th>
                <th className="p-3.5">Student ID & Name</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5 text-center">Risk Score</th>
                <th className="p-3.5 text-center">Risk Category</th>
                <th className="p-3.5">Primary Contributing Factor</th>
                <th className="p-3.5">Recommended Intervention</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {atRiskRoster.map((student, idx) => (
                <tr key={student.Student_ID} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3.5 font-bold text-slate-400">#{idx + 1}</td>
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900 dark:text-white">{student.Student_Name}</p>
                    <p className="text-[10px] text-slate-400">{student.Student_ID}</p>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">{student.Department}</td>
                  <td className="p-3.5 text-center font-black text-sm text-slate-900 dark:text-white">
                    {student.riskScore}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full ${student.badgeColor}`}>
                      {student.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-red-600 dark:text-red-400 font-semibold">{student.mainFactor}</td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">{student.recAction}</td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => openStudentProfile(student)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 text-slate-700 dark:text-slate-200 transition-colors shadow-sm cursor-pointer"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      </button>
                      <button
                        onClick={() => handleQuickIntervention(student)}
                        className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-[11px] rounded-xl shadow-sm transition-all flex items-center space-x-1"
                      >
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>Intervene</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
