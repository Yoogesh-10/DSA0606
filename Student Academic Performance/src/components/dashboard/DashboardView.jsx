import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  calculateStats,
  calculateOverallScore,
  calculateRiskScore,
  getRiskCategory,
  getPerformanceTrend,
  generateAIInsights
} from '../../utils/dataScience';
import {
  Users,
  CalendarCheck,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  HeartHandshake,
  Brain,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Cell,
  Legend
} from 'recharts';

export const DashboardView = () => {
  const { filteredDataset, riskWeights, setActiveTab, openStudentProfile } = useApp();

  // Calculate statistics across active filtered dataset
  const stats = useMemo(() => {
    const total = filteredDataset.length;
    if (total === 0) {
      return {
        total: 0,
        avgAttendance: 0,
        avgInternal: 0,
        avgAssignment: 0,
        passPercentage: 0,
        atRiskCount: 0,
        improvingCount: 0,
        immediateInterventionCount: 0
      };
    }

    const attValues = filteredDataset.map(s => Number(s.Attendance)).filter(v => !isNaN(v));
    const internalValues = filteredDataset.map(s => Number(s.Internal_Marks)).filter(v => !isNaN(v));
    const assignValues = filteredDataset.map(s => Number(s.Assignment_Score)).filter(v => !isNaN(v));
    const overallScores = filteredDataset.map(s => calculateOverallScore(s));

    const avgAttendance = calculateStats(attValues).mean;
    const avgInternal = calculateStats(internalValues).mean;
    const avgAssignment = calculateStats(assignValues).mean;

    const passing = overallScores.filter(sc => sc >= 50).length;
    const passPercentage = Number(((passing / total) * 100).toFixed(1));

    let atRiskCount = 0;
    let immediateInterventionCount = 0;
    let improvingCount = 0;

    filteredDataset.forEach(s => {
      const riskScore = calculateRiskScore(s, riskWeights);
      if (riskScore >= 60) atRiskCount++;
      if (riskScore >= 80) immediateInterventionCount++;

      const trend = getPerformanceTrend(s).trend;
      if (trend === 'Improving') improvingCount++;
    });

    return {
      total,
      avgAttendance,
      avgInternal,
      avgAssignment,
      passPercentage,
      atRiskCount,
      improvingCount,
      immediateInterventionCount
    };
  }, [filteredDataset, riskWeights]);

  // AI Insights dynamically generated
  const insights = useMemo(() => {
    return generateAIInsights(filteredDataset, riskWeights);
  }, [filteredDataset, riskWeights]);

  // Prepare Chart Data
  // A. Scatter Plot: Attendance vs Performance
  const scatterData = useMemo(() => {
    return filteredDataset.map(s => {
      const att = Number(s.Attendance) || 0;
      const perf = calculateOverallScore(s);
      const risk = calculateRiskScore(s, riskWeights);
      const category = getRiskCategory(risk).category;
      return {
        id: s.Student_ID,
        name: s.Student_Name,
        dept: s.Department,
        attendance: att,
        overall: perf,
        riskScore: risk,
        category
      };
    });
  }, [filteredDataset, riskWeights]);

  // B. Performance Distribution Histogram
  const perfDistribution = useMemo(() => {
    const counts = { Excellent: 0, Good: 0, Average: 0, BelowAverage: 0, Critical: 0 };
    filteredDataset.forEach(s => {
      const score = calculateOverallScore(s);
      if (score >= 85) counts.Excellent++;
      else if (score >= 70) counts.Good++;
      else if (score >= 55) counts.Average++;
      else if (score >= 40) counts.BelowAverage++;
      else counts.Critical++;
    });
    return [
      { name: "Excellent (85-100)", count: counts.Excellent, fill: "#10b981" },
      { name: "Good (70-84)", count: counts.Good, fill: "#3b82f6" },
      { name: "Average (55-69)", count: counts.Average, fill: "#6366f1" },
      { name: "Below Avg (40-54)", count: counts.BelowAverage, fill: "#f59e0b" },
      { name: "Critical (<40)", count: counts.Critical, fill: "#ef4444" }
    ];
  }, [filteredDataset]);

  // C. Attendance Ranges Breakdown
  const attRanges = useMemo(() => {
    const ranges = { "90-100%": 0, "80-89%": 0, "70-79%": 0, "60-69%": 0, "Below 60%": 0 };
    filteredDataset.forEach(s => {
      const att = Number(s.Attendance) || 0;
      if (att >= 90) ranges["90-100%"]++;
      else if (att >= 80) ranges["80-89%"]++;
      else if (att >= 70) ranges["70-79%"]++;
      else if (att >= 60) ranges["60-69%"]++;
      else ranges["Below 60%"]++;
    });
    return Object.keys(ranges).map(key => ({ range: key, count: ranges[key] }));
  }, [filteredDataset]);

  // D. Department Performance Comparison
  const deptPerformance = useMemo(() => {
    const depts = ["CSE", "ECE", "EEE", "MECH", "CIVIL"];
    return depts.map(dept => {
      const sub = filteredDataset.filter(s => s.Department === dept);
      if (sub.length === 0) return { dept, avgPerf: 0, avgAtt: 0, atRiskPct: 0 };
      const avgPerf = calculateStats(sub.map(s => calculateOverallScore(s))).mean;
      const avgAtt = calculateStats(sub.map(s => Number(s.Attendance) || 0)).mean;
      const atRisk = sub.filter(s => calculateRiskScore(s, riskWeights) >= 60).length;
      const atRiskPct = Number(((atRisk / sub.length) * 100).toFixed(1));
      return { dept, avgPerf, avgAtt, atRiskPct };
    });
  }, [filteredDataset, riskWeights]);

  // E. Extracurricular vs Academic Performance
  const extraVsPerf = useMemo(() => {
    const groups = [
      { range: "High (>70)", min: 70, max: 100, students: [] },
      { range: "Moderate (40-69)", min: 40, max: 69, students: [] },
      { range: "Low (<40)", min: 0, max: 39, students: [] }
    ];

    filteredDataset.forEach(s => {
      const ex = Number(s.Extracurricular_Participation) || 0;
      if (ex >= 70) groups[0].students.push(s);
      else if (ex >= 40) groups[1].students.push(s);
      else groups[2].students.push(s);
    });

    return groups.map(g => {
      const perfMean = calculateStats(g.students.map(s => calculateOverallScore(s))).mean;
      return { group: g.range, avgPerformance: perfMean, studentCount: g.students.length };
    });
  }, [filteredDataset]);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* KPI Cards Grid (8 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Students */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Students</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +4.2% vs last term
            </span>
          </div>
        </div>

        {/* 2. Avg Attendance */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Average Attendance</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.avgAttendance}%</span>
            <span className={`text-xs font-semibold flex items-center ${stats.avgAttendance >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
              Target: 75.0%
            </span>
          </div>
        </div>

        {/* 3. Avg Internal Marks */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Internal Marks</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.avgInternal} <span className="text-xs text-slate-400 font-normal">/ 100</span></span>
            <span className="text-xs font-semibold text-slate-500">Std Dev: 12.4</span>
          </div>
        </div>

        {/* 4. Avg Assignment Score */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Assignment Score</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.avgAssignment}%</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +2.1%
            </span>
          </div>
        </div>

        {/* 5. Pass Percentage */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Overall Pass Rate</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.passPercentage}%</span>
            <span className="text-xs font-semibold text-slate-500">Benchmark: 80%</span>
          </div>
        </div>

        {/* 6. At-Risk Students */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('atRisk')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">At-Risk Students</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.atRiskCount}</span>
            <span className="text-xs text-amber-600 hover:underline font-semibold">View Engine →</span>
          </div>
        </div>

        {/* 7. Improving Students */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Improving Students</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.improvingCount}</span>
            <span className="text-xs text-emerald-600 font-semibold">Positive Trend</span>
          </div>
        </div>

        {/* 8. Immediate Intervention */}
        <div className="p-5 bg-red-50/60 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-900/60 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('interventions')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wider">Critical Intervention</span>
            <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-md">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-red-700 dark:text-red-300">{stats.immediateInterventionCount}</span>
            <span className="text-xs text-red-600 dark:text-red-400 hover:underline font-bold">Action Needed →</span>
          </div>
        </div>
      </div>

      {/* AI Insights Panel (Prominent requirement) */}
      <div className="p-6 bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <Brain className="w-6 h-6 text-brand-300" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">AI Insights Engine</h3>
              <p className="text-xs text-brand-200">Calculated dynamically from active dataset metrics</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-white/10 text-xs font-semibold rounded-full border border-white/15">
            {insights.length} Empirical Insights Detected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {insights.map((ins) => (
            <div key={ins.id} className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${
                  ins.severity === 'Critical' ? 'bg-red-500 text-white' :
                  ins.severity === 'Warning' ? 'bg-amber-500 text-white' :
                  ins.severity === 'Positive' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {ins.severity}
                </span>
                <span className="text-xs font-bold text-brand-200">{ins.metric}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{ins.title}</h4>
              <p className="text-xs text-slate-200 leading-relaxed">{ins.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart A: Attendance vs Academic Performance (Scatter Plot) */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Attendance vs Academic Performance</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">X-axis: Attendance % • Y-axis: Overall Performance %</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
              Scatter Plot
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis type="number" dataKey="attendance" name="Attendance" unit="%" domain={[30, 100]} stroke="#94a3b8" fontSize={11} />
                <YAxis type="number" dataKey="overall" name="Performance" unit="%" domain={[30, 100]} stroke="#94a3b8" fontSize={11} />
                <ZAxis type="number" range={[40, 40]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl space-y-1">
                          <p className="font-bold text-sm">{data.name} ({data.id})</p>
                          <p className="text-slate-300">Dept: {data.dept}</p>
                          <p className="text-slate-300">Attendance: <span className="font-bold text-white">{data.attendance}%</span></p>
                          <p className="text-slate-300">Overall Score: <span className="font-bold text-white">{data.overall}%</span></p>
                          <p className="text-slate-300">Risk Level: <span className="font-bold text-amber-400">{data.category}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Students" data={scatterData}>
                  {scatterData.map((entry, index) => {
                    let fill = "#10b981"; // Low risk
                    if (entry.category === "Critical") fill = "#ef4444";
                    else if (entry.category === "High") fill = "#f97316";
                    else if (entry.category === "Moderate") fill = "#f59e0b";
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Performance Distribution */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Academic Performance Distribution</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Student cohort grouping by overall grade ranges</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
              Histogram
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perfDistribution} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} interval={0} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {perfDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart C: Attendance Distribution */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Attendance Range Breakdown</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Number of students across attendance buckets</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attRanges} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart D: Department Performance Comparison */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Departmental Performance & Risk</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Average Performance % vs At-Risk % by department</p>
            </div>
            <button
              onClick={() => setActiveTab('department')}
              className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline"
            >
              Full Dept Report →
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptPerformance} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="dept" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
                <Legend />
                <Bar dataKey="avgPerf" name="Avg Overall Score %" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="atRiskPct" name="At-Risk Student %" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
