import React from 'react';
import { useApp } from '../../context/AppContext';
import { NotificationCenter } from './NotificationCenter';
import { Search, Sun, Moon, Filter, User, RotateCcw } from 'lucide-react';

const PAGE_TITLES = {
  landing: { title: "Welcome to EduPulse AI", subtitle: "Turn Student Data Into Early Intervention Action" },
  dashboard: { title: "Academic Analytics Dashboard", subtitle: "Real-time institutional performance metrics & AI insights" },
  upload: { title: "Data Upload & Data Quality Center", subtitle: "CSV/Excel ingestion, defect detection & client-side cleaning" },
  analytics: { title: "Student Performance Directory", subtitle: "Comprehensive searchable roster and student profile explorer" },
  performance: { title: "Performance Analysis (EDA)", subtitle: "Exploratory bivariate factor distributions & statistical takeaways" },
  correlation: { title: "Correlation Explorer", subtitle: "Pearson correlation matrix heatmap & variable dependency analysis" },
  atRisk: { title: "At-Risk Student Detection Engine", subtitle: "Multi-factor weighted risk scoring and targeted intervention alerts" },
  interventions: { title: "Early Intervention Center", subtitle: "Faculty workflow management, mentoring assignment & tracking" },
  comparison: { title: "Student Multi-Comparison Tool", subtitle: "Comparative side-by-side metric overlay & radar benchmarking" },
  simulator: { title: "What-If Performance Simulator", subtitle: "Interactive score estimation and risk transition modeling" },
  segmentation: { title: "Student Cohort Segmentation", subtitle: "Rule-based cluster profiling & risk grouping" },
  department: { title: "Departmental Performance Analytics", subtitle: "Cross-departmental academic indicators & comparison" },
  council: { title: "Academic Council Executive View", subtitle: "Institutional summary, policy indicators & decision support" },
  reports: { title: "Academic Report Generator", subtitle: "Generate, export, and print comprehensive institutional reports" },
  settings: { title: "System Configuration & Weights", subtitle: "Customize risk scoring parameters, thresholds & parameters" }
};

export const Header = ({ isCollapsed }) => {
  const {
    activeTab,
    globalFilters,
    setGlobalFilters,
    searchQuery,
    setSearchQuery,
    darkMode,
    toggleDarkMode,
    resetToSampleDataset
  } = useApp();

  const pageInfo = PAGE_TITLES[activeTab] || { title: "EduPulse AI", subtitle: "Academic Intelligence System" };

  const handleFilterChange = (key, value) => {
    setGlobalFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setGlobalFilters({
      academicYear: '2024-25',
      department: 'All',
      course: 'All',
      semester: 'All',
      riskLevel: 'All'
    });
    setSearchQuery('');
  };

  return (
    <header className={`sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300 no-print ${
      isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
    }`}>
      {/* Upper Header Row */}
      <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {pageInfo.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {pageInfo.subtitle}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Global Search Bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student, ID, dept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-brand-500 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <NotificationCenter />

          {/* Profile Badge */}
          <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              AC
            </div>
            <div className="text-left hidden xl:block">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Dr. S. Sharma</p>
              <p className="text-[10px] text-slate-400">Academic Council Dean</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Filter Bar Row */}
      <div className="px-6 py-2.5 bg-slate-50/70 dark:bg-slate-900/50 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 font-semibold text-slate-500 dark:text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Global Filters:</span>
          </div>

          {/* Academic Year */}
          <select
            value={globalFilters.academicYear}
            onChange={(e) => handleFilterChange('academicYear', e.target.value)}
            className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium focus:ring-1 focus:ring-brand-500 outline-none"
          >
            <option value="2024-25">2024–25</option>
            <option value="2023-24">2023–24</option>
          </select>

          {/* Department */}
          <select
            value={globalFilters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium focus:ring-1 focus:ring-brand-500 outline-none"
          >
            <option value="All">Dept: All</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
          </select>

          {/* Semester */}
          <select
            value={globalFilters.semester}
            onChange={(e) => handleFilterChange('semester', e.target.value)}
            className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium focus:ring-1 focus:ring-brand-500 outline-none"
          >
            <option value="All">Sem: All</option>
            <option value="1">Sem 1</option>
            <option value="2">Sem 2</option>
            <option value="3">Sem 3</option>
            <option value="4">Sem 4</option>
            <option value="5">Sem 5</option>
            <option value="6">Sem 6</option>
          </select>

          {/* Risk Level */}
          <select
            value={globalFilters.riskLevel}
            onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
            className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium focus:ring-1 focus:ring-brand-500 outline-none"
          >
            <option value="All">Risk: All Levels</option>
            <option value="Critical">Risk: Critical</option>
            <option value="High">Risk: High</option>
            <option value="Moderate">Risk: Moderate</option>
            <option value="Low">Risk: Low</option>
          </select>

          {/* Reset Filters */}
          {(globalFilters.department !== 'All' || globalFilters.semester !== 'All' || globalFilters.riskLevel !== 'All' || searchQuery !== '') && (
            <button
              onClick={resetFilters}
              className="px-2.5 py-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 font-medium">
          <span>Dataset State:</span>
          <button
            onClick={resetToSampleDataset}
            className="px-2.5 py-1 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 hover:bg-brand-100 rounded-lg font-semibold transition-colors"
          >
            Reset Dataset
          </button>
        </div>
      </div>
    </header>
  );
};
