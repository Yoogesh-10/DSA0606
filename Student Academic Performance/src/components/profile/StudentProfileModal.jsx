import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  calculateOverallScore,
  calculateRiskScore,
  getRiskCategory,
  getPerformanceTrend
} from '../../utils/dataScience';
import {
  X,
  User,
  GraduationCap,
  Calendar,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  HeartHandshake,
  ShieldAlert
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

export const StudentProfileModal = ({ student, onClose }) => {
  const { riskWeights, addIntervention, setActiveTab } = useApp();

  if (!student) return null;

  const overallScore = calculateOverallScore(student);
  const riskScore = calculateRiskScore(student, riskWeights);
  const riskInfo = getRiskCategory(riskScore);
  const trendInfo = getPerformanceTrend(student);

  const att = Number(student.Attendance) || 0;
  const internal = Number(student.Internal_Marks) || 0;
  const assign = Number(student.Assignment_Score) || 0;
  const prev = Number(student.Previous_Semester_Marks) || 0;
  const curr = Number(student.Current_Semester_Marks) || 0;

  // Semester Trend Chart Data
  const trendData = [
    { sem: `Sem ${Math.max(1, student.Semester - 1)}`, score: prev },
    { sem: `Sem ${student.Semester}`, score: curr }
  ];

  // Radar chart data for multi-dimensional performance
  const radarData = [
    { subject: 'Attendance', score: att, fullMark: 100 },
    { subject: 'Internal Marks', score: internal, fullMark: 100 },
    { subject: 'Assignment', score: assign, fullMark: 100 },
    { subject: 'Prev Semester', score: prev, fullMark: 100 },
    { subject: 'Curr Semester', score: curr, fullMark: 100 }
  ];

  // Derive Positive & Risk Factors dynamically
  const positiveFactors = [];
  const riskFactors = [];

  if (att >= 85) positiveFactors.push("Strong attendance consistency (≥85%)");
  else if (att < 70) riskFactors.push("Attendance dropped below 70% threshold");

  if (assign >= 80) positiveFactors.push("High assignment submission & quality score");
  else if (assign < 60) riskFactors.push("Deficient assignment score (<60%)");

  if (internal >= 75) positiveFactors.push("Solid internal assessment performance");
  else if (internal < 60) riskFactors.push("Below-average internal test scores");

  if (curr > prev) positiveFactors.push(`Positive academic momentum (+${curr - prev}% vs prev semester)`);
  else if (prev - curr >= 5) riskFactors.push(`Declining semester performance (-${prev - curr}%)`);

  // Recommended Actions
  const recommendations = [];
  if (att < 75) recommendations.push("Schedule mandatory attendance counseling with HOD.");
  if (assign < 65) recommendations.push("Assign peer tutor for assignment problem-solving.");
  if (internal < 60) recommendations.push("Enroll in remedial tutorial classes for internal assessment.");
  if (recommendations.length === 0) recommendations.push("Maintain current performance and participate in peer mentoring.");

  // Early Warning Timeline events (Section 13 requirement)
  const timelineEvents = [
    { date: "Week 2", event: "Semester registration completed", type: "info" },
    ...(att < 75 ? [{ date: "Week 6", event: `Attendance flag triggered: Attendance dropped to ${att}%`, type: "warning" }] : []),
    ...(internal < 60 ? [{ date: "Week 8", event: `Internal test result flagged: Score recorded at ${internal}/100`, type: "danger" }] : []),
    ...(riskScore >= 60 ? [{ date: "Week 10", event: `Risk Engine Alert: Risk Score computed at ${riskScore} (${riskInfo.category} Risk)`, type: "danger" }] : []),
    { date: "Recent", event: `Current Semester mark evaluated at ${curr}%`, type: "info" }
  ];

  const handleCreateIntervention = () => {
    const newInt = {
      id: `INT-${Date.now()}`,
      studentId: student.Student_ID,
      studentName: student.Student_Name,
      department: student.Department,
      riskScore,
      mainFactor: riskFactors[0] || "Low Academic Score",
      recommendedAction: recommendations[0] || "Academic Mentoring",
      assignedFaculty: "Faculty Advisor",
      priority: riskScore >= 80 ? "Critical" : "High",
      status: "Pending",
      assignedDate: new Date().toISOString().split('T')[0],
      notes: "Auto-generated intervention from Student Profile review."
    };
    addIntervention(newInt);
    onClose();
    setActiveTab('interventions');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-extrabold text-xl border border-white/20">
              {student.Student_Name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-extrabold text-white">{student.Student_Name}</h3>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-white/10 rounded-full text-brand-300">
                  {student.Student_ID}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {student.Department} Department • {student.Course} • Semester {student.Semester}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Overall Score</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{overallScore}%</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Risk Level</span>
              <div className="mt-1 flex items-center space-x-2">
                <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full ${riskInfo.badgeColor}`}>
                  {riskInfo.category} ({riskScore})
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Attendance</span>
              <p className={`text-2xl font-black mt-1 ${att >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>{att}%</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Performance Trend</span>
              <p className={`text-sm font-extrabold mt-1 flex items-center ${trendInfo.color}`}>
                <span className="mr-1 text-base">{trendInfo.symbol}</span> {trendInfo.trend}
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Semester Trend Line Chart */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Semester Performance Trajectory</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="sem" stroke="#94a3b8" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff' }} />
                    <Line type="monotone" dataKey="score" stroke="#0c8de4" strokeWidth={3} dot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Multi-Factor Chart */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Multi-Factor Skill Radar</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid opacity={0.3} />
                    <PolarAngleAxis dataKey="subject" fontSize={9} stroke="#94a3b8" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={8} />
                    <Radar name={student.Student_Name} dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Factors Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Positive Factors */}
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 space-y-2">
              <h4 className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Positive Factors</span>
              </h4>
              <ul className="space-y-1 text-xs text-emerald-800 dark:text-emerald-200">
                {positiveFactors.length > 0 ? (
                  positiveFactors.map((f, i) => <li key={i}>• {f}</li>)
                ) : (
                  <li className="italic text-slate-400">No major positive factors noted.</li>
                )}
              </ul>
            </div>

            {/* Risk Factors */}
            <div className="p-4 bg-red-50/60 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900/40 space-y-2">
              <h4 className="text-xs font-extrabold text-red-900 dark:text-red-300 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Risk Factors</span>
              </h4>
              <ul className="space-y-1 text-xs text-red-800 dark:text-red-200">
                {riskFactors.length > 0 ? (
                  riskFactors.map((f, i) => <li key={i}>• {f}</li>)
                ) : (
                  <li className="text-emerald-600 font-medium">No critical risk flags detected.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900/40 space-y-2">
            <h4 className="text-xs font-extrabold text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center space-x-1.5">
              <HeartHandshake className="w-4 h-4 text-blue-600" />
              <span>Recommended Intervention Plan</span>
            </h4>
            <div className="space-y-1 text-xs text-blue-900 dark:text-blue-200 font-medium">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 13 Feature: Early Warning Timeline */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>Early Warning Timeline Log</span>
            </h4>

            <div className="space-y-3 relative pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2">
              {timelineEvents.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className={`w-3 h-3 rounded-full absolute -left-[23px] top-0.5 border-2 border-white dark:border-slate-900 ${
                    item.type === 'danger' ? 'bg-red-500' : item.type === 'warning' ? 'bg-amber-500' : 'bg-brand-500'
                  }`} />
                  <span className="text-[10px] font-bold text-slate-400 block">{item.date}</span>
                  <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">{item.event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            Close Profile
          </button>

          {riskScore >= 40 && (
            <button
              onClick={handleCreateIntervention}
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Assign Early Intervention</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
