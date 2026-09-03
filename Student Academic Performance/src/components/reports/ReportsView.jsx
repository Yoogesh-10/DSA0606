import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateStats, calculateOverallScore, calculateRiskScore, generateAIInsights } from '../../utils/dataScience';
import { exportToCSV, triggerPrint } from '../../utils/exportUtils';
import { FileText, Printer, Download, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ReportsView = () => {
  const { dataset, rawDataset, dataQuality, riskWeights, interventions } = useApp();

  const totalStudents = dataset.length;
  const overallMean = calculateStats(dataset.map(s => calculateOverallScore(s))).mean;
  const attendanceMean = calculateStats(dataset.map(s => Number(s.Attendance) || 0)).mean;
  const atRiskCount = dataset.filter(s => calculateRiskScore(s, riskWeights) >= 60).length;

  const insights = useMemo(() => generateAIInsights(dataset, riskWeights), [dataset, riskWeights]);

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Top Action Bar */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-brand-600" />
            <span>Academic Performance Executive Report</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generated automatically for the Academic Council and Faculty Deans
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportToCSV('EduPulse_Institutional_Report.csv', dataset)}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Raw Data CSV</span>
          </button>

          <button
            onClick={triggerPrint}
            className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Report Document Body */}
      <div className="p-8 sm:p-12 bg-white text-slate-900 rounded-3xl shadow-xl border border-slate-200 space-y-8 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800">
        {/* Document Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              EDUPULSE AI ACADEMIC COUNCIL REPORT
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
              Student Performance & Early Intervention Summary • Academic Year 2024–25
            </p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>Generated: {new Date().toLocaleDateString()}</p>
            <p>Status: Verified</p>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <div className="space-y-3">
          <h2 className="text-base font-extrabold text-brand-700 dark:text-brand-400 uppercase tracking-wider">
            1. Executive Summary
          </h2>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            This comprehensive report evaluates student academic records across 5 engineering departments ({totalStudents} enrolled students). Empirical analysis demonstrates an overall institutional mean performance score of <strong>{overallMean}%</strong> with an average attendance rate of <strong>{attendanceMean}%</strong>. A total of <strong>{atRiskCount} students ({Math.round((atRiskCount/totalStudents)*100)}%)</strong> have been identified as requiring early intervention attention.
          </p>
        </div>

        {/* 2. Data Quality Audit */}
        <div className="space-y-3">
          <h2 className="text-base font-extrabold text-brand-700 dark:text-brand-400 uppercase tracking-wider">
            2. Data Quality Audit
          </h2>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-bold text-center">
              <div>Quality Index: <span className="text-emerald-600">{dataQuality.qualityScore}/100</span></div>
              <div>Ingested: <span>{dataQuality.totalRecords}</span></div>
              <div>Missing Records: <span className="text-amber-600">{dataQuality.missingCount}</span></div>
              <div>Duplicates Purged: <span className="text-purple-600">{dataQuality.duplicateCount}</span></div>
            </div>
          </div>
        </div>

        {/* 3. Key Statistics Table */}
        <div className="space-y-3">
          <h2 className="text-base font-extrabold text-brand-700 dark:text-brand-400 uppercase tracking-wider">
            3. Key Institutional Statistics
          </h2>
          <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-100 dark:bg-slate-800 font-bold uppercase">
              <tr>
                <th className="p-2.5">Indicator</th>
                <th className="p-2.5 text-right">Calculated Metric</th>
                <th className="p-2.5">Target Benchmark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr><td className="p-2.5 font-bold">Total Student Roster</td><td className="p-2.5 text-right font-black">{totalStudents}</td><td className="p-2.5 text-slate-400">N/A</td></tr>
              <tr><td className="p-2.5 font-bold">Average Attendance Rate</td><td className="p-2.5 text-right font-black">{attendanceMean}%</td><td className="p-2.5 text-emerald-600">75.0%</td></tr>
              <tr><td className="p-2.5 font-bold">Average Overall Score</td><td className="p-2.5 text-right font-black">{overallMean}%</td><td className="p-2.5 text-emerald-600">70.0%</td></tr>
              <tr><td className="p-2.5 font-bold">At-Risk Student Count</td><td className="p-2.5 text-right font-black text-red-500">{atRiskCount}</td><td className="p-2.5 text-slate-400">&lt; 10%</td></tr>
              <tr><td className="p-2.5 font-bold">Active Interventions</td><td className="p-2.5 text-right font-black text-amber-500">{interventions.filter(i => i.status !== 'Completed').length}</td><td className="p-2.5 text-slate-400">Ongoing</td></tr>
            </tbody>
          </table>
        </div>

        {/* 4. AI Insights Summary */}
        <div className="space-y-3">
          <h2 className="text-base font-extrabold text-brand-700 dark:text-brand-400 uppercase tracking-wider">
            4. Empirical Factor Findings
          </h2>
          <div className="space-y-2 text-xs">
            {insights.map(ins => (
              <div key={ins.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white">• {ins.title}:</span> {ins.text}
              </div>
            ))}
          </div>
        </div>

        {/* 5. Council Directives */}
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-extrabold text-brand-700 dark:text-brand-400 uppercase tracking-wider">
            5. Final Recommendations & Policy Actions
          </h2>
          <ol className="list-decimal pl-5 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 font-medium">
            <li>Enforce mandatory parent communications for students with attendance &lt; 65%.</li>
            <li>Direct department HODs to conduct bi-weekly remedial assignment reviews.</li>
            <li>Maintain client-side data cleaning logs for quality compliance audits.</li>
          </ol>
        </div>

        <div className="pt-8 text-center text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
          EduPulse AI • Automated Academic Performance Analysis System • End of Report
        </div>
      </div>
    </div>
  );
};
