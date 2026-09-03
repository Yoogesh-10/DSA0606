import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateStats, calculateOverallScore, calculateRiskScore } from '../../utils/dataScience';
import { GraduationCap, Award, ShieldAlert, HeartHandshake, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';

export const AcademicCouncilView = () => {
  const { dataset, riskWeights, interventions, setActiveTab } = useApp();

  const metrics = useMemo(() => {
    const total = dataset.length;
    if (total === 0) return { total: 0, overall: 0, att: 0, passRate: 0, atRiskPct: 0 };

    const scores = dataset.map(s => calculateOverallScore(s));
    const atts = dataset.map(s => Number(s.Attendance) || 0);

    const overall = calculateStats(scores).mean;
    const att = calculateStats(atts).mean;

    const passing = scores.filter(s => s >= 50).length;
    const passRate = Number(((passing / total) * 100).toFixed(1));

    const atRisk = dataset.filter(s => calculateRiskScore(s, riskWeights) >= 60).length;
    const atRiskPct = Number(((atRisk / total) * 100).toFixed(1));

    return { total, overall, att, passRate, atRiskPct, atRiskCount: atRisk };
  }, [dataset, riskWeights]);

  const activeInterventionsCount = interventions.filter(i => i.status !== 'Completed').length;
  const completedInterventionsCount = interventions.filter(i => i.status === 'Completed').length;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Executive Banner */}
      <div className="p-8 bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 text-white rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
            <GraduationCap className="w-7 h-7 text-brand-300" />
          </div>
          <div>
            <h3 className="text-2xl font-black">Academic Council Executive Briefing</h3>
            <p className="text-xs text-brand-200">Institutional Strategy & Decision Support Dashboard</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          This view aggregates academic risk indices across all departments, tracking early intervention completion efficiency to guide institutional resource allocation and policy interventions.
        </p>
      </div>

      {/* Institutional High Level Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Enrolled</span>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{metrics.total}</p>
          <p className="text-[11px] text-slate-400 mt-1">Across 5 departments</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Institutional Score</span>
          <p className="text-3xl font-black text-brand-600 mt-1">{metrics.overall}%</p>
          <p className="text-[11px] text-slate-400 mt-1">Weighted overall mean</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Avg Attendance</span>
          <p className="text-3xl font-black text-indigo-600 mt-1">{metrics.att}%</p>
          <p className="text-[11px] text-slate-400 mt-1">Campus wide average</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Pass Rate</span>
          <p className="text-3xl font-black text-emerald-600 mt-1">{metrics.passRate}%</p>
          <p className="text-[11px] text-slate-400 mt-1">Overall passing cohort</p>
        </div>

        <div className="p-5 bg-red-50/60 dark:bg-red-950/40 rounded-3xl border border-red-200 dark:border-red-900/60 shadow-sm">
          <span className="text-xs font-bold text-red-800 dark:text-red-300 uppercase">At-Risk Ratio</span>
          <p className="text-3xl font-black text-red-600 mt-1">{metrics.atRiskPct}%</p>
          <p className="text-[11px] text-red-700 dark:text-red-300 mt-1">{metrics.atRiskCount} High-Risk Students</p>
        </div>
      </div>

      {/* Council Strategic Recommendations (Requirement 18) */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h4 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Academic Council Strategic Directives</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/40 space-y-2">
            <span className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase">Policy Directive #1</span>
            <h5 className="text-sm font-bold text-slate-900 dark:text-white">Attendance Monitoring Threshold</h5>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Mandate weekly automated HOD check-ins for all students falling below the 70% attendance threshold.
            </p>
          </div>

          <div className="p-5 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900/40 space-y-2">
            <span className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase">Policy Directive #2</span>
            <h5 className="text-sm font-bold text-slate-900 dark:text-white">Assignment Completion Peer Support</h5>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Introduce peer-led tutorial sessions specifically targeted at students with assignment scores under 60%.
            </p>
          </div>

          <div className="p-5 bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-900/40 space-y-2">
            <span className="text-xs font-black text-purple-800 dark:text-purple-300 uppercase">Policy Directive #3</span>
            <h5 className="text-sm font-bold text-slate-900 dark:text-white">Declining Trend Mentoring</h5>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Prioritize faculty academic mentoring for students exhibiting a negative semester-over-semester score trajectory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
