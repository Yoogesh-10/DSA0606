import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateStats, calculateOverallScore, calculateRiskScore } from '../../utils/dataScience';
import { Building2, Award, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const DepartmentAnalyticsView = () => {
  const { dataset, riskWeights } = useApp();

  const depts = ["CSE", "ECE", "EEE", "MECH", "CIVIL"];

  const deptMetrics = useMemo(() => {
    return depts.map(dept => {
      const sub = dataset.filter(s => s.Department === dept);
      if (sub.length === 0) {
        return { dept, total: 0, avgAtt: 0, avgInternal: 0, avgAssign: 0, avgPerf: 0, passRate: 0, atRiskPct: 0 };
      }

      const total = sub.length;
      const avgAtt = calculateStats(sub.map(s => Number(s.Attendance) || 0)).mean;
      const avgInternal = calculateStats(sub.map(s => Number(s.Internal_Marks) || 0)).mean;
      const avgAssign = calculateStats(sub.map(s => Number(s.Assignment_Score) || 0)).mean;

      const scores = sub.map(s => calculateOverallScore(s));
      const avgPerf = calculateStats(scores).mean;

      const passing = scores.filter(sc => sc >= 50).length;
      const passRate = Number(((passing / total) * 100).toFixed(1));

      const atRisk = sub.filter(s => calculateRiskScore(s, riskWeights) >= 60).length;
      const atRiskPct = Number(((atRisk / total) * 100).toFixed(1));

      return { dept, total, avgAtt, avgInternal, avgAssign, avgPerf, passRate, atRiskPct };
    });
  }, [dataset, riskWeights]);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-brand-600" />
          <span>Departmental Performance Analytics</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Institutional comparison across CSE, ECE, EEE, MECH, and CIVIL academic departments.
        </p>
      </div>

      {/* Cards per department */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {deptMetrics.map(d => (
          <div key={d.dept} className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-black text-lg text-slate-900 dark:text-white">{d.dept}</span>
              <span className="text-xs font-bold text-slate-400">{d.total} Students</span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Avg Overall:</span>
                <span className="font-black text-brand-600">{d.avgPerf}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Avg Attendance:</span>
                <span className="font-bold">{d.avgAtt}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Pass Rate:</span>
                <span className="font-bold text-emerald-600">{d.passRate}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">At-Risk Rate:</span>
                <span className="font-bold text-red-500">{d.atRiskPct}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Department Comparative Bar Chart */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Departmental Metric Overlay Chart</h4>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptMetrics} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#94a3b8" />
              <XAxis dataKey="dept" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
              <Legend />
              <Bar dataKey="avgPerf" name="Avg Overall Score %" fill="#0c8de4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgAtt" name="Avg Attendance %" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="atRiskPct" name="At-Risk Student %" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
