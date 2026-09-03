import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Upload,
  Users,
  LineChart,
  Grid,
  AlertTriangle,
  HeartHandshake,
  GitCompare,
  Sliders,
  PieChart,
  Building2,
  GraduationCap,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Home
} from 'lucide-react';
import { calculateRiskScore } from '../../utils/dataScience';

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { activeTab, setActiveTab, filteredDataset, riskWeights, interventions } = useApp();

  // Count at-risk students for badge
  const atRiskCount = useMemo(() => {
    return filteredDataset.filter(s => calculateRiskScore(s, riskWeights) >= 60).length;
  }, [filteredDataset, riskWeights]);

  const activeInterventionsCount = useMemo(() => {
    return interventions.filter(i => i.status !== 'Completed').length;
  }, [interventions]);

  const navItems = [
    { id: 'landing', label: 'Home Landing', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Data Upload & Quality', icon: Upload },
    { id: 'analytics', label: 'Student Analytics', icon: Users },
    { id: 'performance', label: 'Performance Analysis', icon: LineChart },
    { id: 'correlation', label: 'Correlation Explorer', icon: Grid },
    { id: 'atRisk', label: 'At-Risk Students', icon: AlertTriangle, badge: atRiskCount, badgeColor: 'bg-red-500 text-white' },
    { id: 'interventions', label: 'Early Intervention', icon: HeartHandshake, badge: activeInterventionsCount, badgeColor: 'bg-amber-500 text-white' },
    { id: 'comparison', label: 'Student Comparison', icon: GitCompare },
    { id: 'simulator', label: 'Performance Simulator', icon: Sliders },
    { id: 'segmentation', label: 'Student Segmentation', icon: PieChart },
    { id: 'department', label: 'Department Analytics', icon: Building2 },
    { id: 'council', label: 'Academic Council View', icon: GraduationCap },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`fixed top-0 left-0 z-30 h-screen transition-all duration-300 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col no-print ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3 overflow-hidden cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <h1 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight leading-none">
                EduPulse <span className="text-brand-600 dark:text-brand-400">AI</span>
              </h1>
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                Academic Analytics
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}

              {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                <div className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2" />
              )}
            </button>
          );
        })}
      </div>

      {/* System Status Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Engine Active</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            EduPulse AI Enterprise System
          </p>
        </div>
      )}
    </aside>
  );
};
