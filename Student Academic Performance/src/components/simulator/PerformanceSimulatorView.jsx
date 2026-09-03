import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { predictPerformance, calculateOverallScore, calculateRiskScore } from '../../utils/dataScience';
import { Sliders, ArrowRight, TrendingUp, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';

export const PerformanceSimulatorView = () => {
  const { dataset, riskWeights } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState(dataset[0]?.Student_ID || '');
  const [deltaAtt, setDeltaAtt] = useState(15);
  const [deltaInternal, setDeltaInternal] = useState(10);
  const [deltaAssign, setDeltaAssign] = useState(15);

  const student = dataset.find(s => s.Student_ID === selectedStudentId) || dataset[0];

  if (!student) return null;

  const simResult = predictPerformance(student, deltaAtt, deltaInternal, deltaAssign, riskWeights);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header Disclaimer Card */}
      <div className="p-6 bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl space-y-3">
        <div className="flex items-center space-x-2 text-brand-300 text-xs font-bold uppercase tracking-wider">
          <Sliders className="w-5 h-5 text-brand-400" />
          <span>What-If Academic Scenario Simulator</span>
        </div>

        <h3 className="text-xl font-extrabold">Simulate Early Intervention Impact</h3>
        <p className="text-xs text-slate-200 leading-relaxed max-w-3xl">
          Adjust hypothetical attendance improvements, assignment completion, and internal test boosts to observe predicted overall grade changes and risk level reductions.
        </p>

        <span className="inline-block px-3 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[11px] font-bold rounded-full">
          Predictive Analytics Engine: Calculated using weighted academic regression factors.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Simulation Controls</h4>

          {/* Student Selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
            >
              {dataset.map(s => (
                <option key={s.Student_ID} value={s.Student_ID}>
                  {s.Student_Name} ({s.Student_ID} • {s.Department})
                </option>
              ))}
            </select>
          </div>

          {/* Current Values Display */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-2">
            <span className="font-bold text-slate-500 uppercase">Baseline Record</span>
            <div className="flex justify-between"><span>Attendance:</span><span className="font-bold">{student.Attendance}%</span></div>
            <div className="flex justify-between"><span>Internal Marks:</span><span className="font-bold">{student.Internal_Marks}</span></div>
            <div className="flex justify-between"><span>Assignment Score:</span><span className="font-bold">{student.Assignment_Score}</span></div>
          </div>

          {/* Sliders */}
          <div className="space-y-4 pt-2">
            {/* Attendance Delta */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Attendance Increase</span>
                <span className="text-brand-600">+{deltaAtt}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={deltaAtt}
                onChange={(e) => setDeltaAtt(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
            </div>

            {/* Internal Marks Delta */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Internal Marks Boost</span>
                <span className="text-brand-600">+{deltaInternal} pts</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={deltaInternal}
                onChange={(e) => setDeltaInternal(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
            </div>

            {/* Assignment Score Delta */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Assignment Completion Boost</span>
                <span className="text-brand-600">+{deltaAssign} pts</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={deltaAssign}
                onChange={(e) => setDeltaAssign(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Visual Outcome Comparison */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">{student.Student_Name}</h4>
                <p className="text-xs text-slate-400">{student.Department} • Semester {student.Semester}</p>
              </div>
              <span className="px-3 py-1 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 font-extrabold text-xs rounded-full">
                Simulated Outcome
              </span>
            </div>

            {/* Side-by-side Score & Risk comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
              {/* Baseline Box */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 space-y-4">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Current State</span>
                <div>
                  <span className="text-xs text-slate-500">Overall Score</span>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">{simResult.current.score}%</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Risk Score</span>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full ${simResult.current.category.badgeColor}`}>
                      {simResult.current.category.category} ({simResult.current.riskScore})
                    </span>
                  </div>
                </div>
              </div>

              {/* Predicted Box */}
              <div className="p-6 bg-gradient-to-br from-brand-500 to-indigo-600 text-white rounded-3xl shadow-xl space-y-4">
                <span className="text-xs font-extrabold text-brand-100 uppercase tracking-wider">Predicted State</span>
                <div>
                  <span className="text-xs text-brand-200">Predicted Overall Score</span>
                  <p className="text-3xl font-black text-white">{simResult.predicted.score}%</p>
                </div>
                <div>
                  <span className="text-xs text-brand-200">Predicted Risk Score</span>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full ${simResult.predicted.category.badgeColor}`}>
                      {simResult.predicted.category.category} ({simResult.predicted.riskScore})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delta Improvement Banner */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              <div>
                <h5 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  Projected Improvement: <span className="font-extrabold text-emerald-600">+{simResult.deltaScore}%</span>
                </h5>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Risk score reduced by {Math.abs(simResult.deltaRisk)} points.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
              {simResult.current.category.category} → {simResult.predicted.category.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
