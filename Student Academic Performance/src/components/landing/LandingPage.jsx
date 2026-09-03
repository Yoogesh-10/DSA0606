import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  Database,
  BarChart3,
  AlertTriangle,
  HeartHandshake,
  Sliders,
  GraduationCap,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  BrainCircuit
} from 'lucide-react';

export const LandingPage = () => {
  const { setActiveTab, resetToSampleDataset } = useApp();

  const handleLoadSample = () => {
    resetToSampleDataset();
    setActiveTab('dashboard');
  };

  const featureCards = [
    {
      title: "Data Quality Intelligence",
      description: "Automated audit for missing records, duplicate IDs, and invalid marks with client-side mean/median imputation.",
      icon: Database,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400"
    },
    {
      title: "Academic Analytics (EDA)",
      description: "Bivariate scatter plots, correlation heatmaps, and empirical statistical factor breakdowns for academic decision makers.",
      icon: BarChart3,
      color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
    },
    {
      title: "Multi-Factor Risk Detection",
      description: "Weighted risk scoring engine combining attendance, internal test marks, assignments, and semester trends.",
      icon: AlertTriangle,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
    },
    {
      title: "Early Intervention Center",
      description: "Faculty mentoring workflows, action assignments, status tracking, and student warning timelines.",
      icon: HeartHandshake,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    },
    {
      title: "What-If Simulator",
      description: "Predictive model enabling faculty to simulate attendance and score scenarios for at-risk students in real time.",
      icon: Sliders,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400"
    },
    {
      title: "Academic Council Insights",
      description: "Executive-level institutional dashboards, policy recommendations, and automated PDF/CSV report generation.",
      icon: GraduationCap,
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400"
    }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between p-6 lg:p-12 max-w-7xl mx-auto space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 pt-6">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold tracking-wide">
          <BrainCircuit className="w-4 h-4 text-brand-600" />
          <span>EduPulse AI • Academic Decision Support Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Turn Student Data Into <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600">
            Early Intervention Action.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
          EduPulse AI helps higher education institutions discover academic patterns, identify at-risk students, conduct data quality audits, and design timely interventions using data-driven insights.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 transition-all flex items-center justify-center space-x-3 group cursor-pointer"
          >
            <span>Explore Analytics Dashboard</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={handleLoadSample}
            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Load Institution Dataset</span>
          </button>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Comprehensive Academic Data Science Workflow
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Built specifically to solve student academic dropouts and performance variance in colleges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:shadow-xl hover:border-brand-200 dark:hover:border-brand-800 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics Workflow Banner */}
      <div className="p-8 bg-gradient-to-r from-slate-900 to-brand-950 text-white rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">End-to-End Analytics Pipeline</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {["RAW DATA", "DATA CLEANING", "EDA & CORRELATIONS", "RISK ENGINE", "EARLY INTERVENTION", "COUNCIL DECISIONS"].map((step, i) => (
              <div key={i} className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                <span className="block text-[10px] text-brand-300 font-bold">STEP {i+1}</span>
                <span className="text-xs font-extrabold text-white mt-1 block">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
