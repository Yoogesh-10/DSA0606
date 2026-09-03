import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { DataUploadView } from './components/upload/DataUploadView';
import { StudentAnalyticsView } from './components/studentAnalytics/StudentAnalyticsView';
import { PerformanceAnalysisView } from './components/performanceAnalysis/PerformanceAnalysisView';
import { CorrelationExplorerView } from './components/correlation/CorrelationExplorerView';
import { AtRiskStudentsView } from './components/risk/AtRiskStudentsView';
import { EarlyInterventionView } from './components/intervention/EarlyInterventionView';
import { StudentComparisonView } from './components/comparison/StudentComparisonView';
import { PerformanceSimulatorView } from './components/simulator/PerformanceSimulatorView';
import { StudentSegmentationView } from './components/segmentation/StudentSegmentationView';
import { DepartmentAnalyticsView } from './components/department/DepartmentAnalyticsView';
import { AcademicCouncilView } from './components/council/AcademicCouncilView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { StudentProfileModal } from './components/profile/StudentProfileModal';

const MainLayout = () => {
  const { activeTab, selectedStudent, closeStudentProfile } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage />;
      case 'dashboard':
        return <DashboardView />;
      case 'upload':
        return <DataUploadView />;
      case 'analytics':
        return <StudentAnalyticsView />;
      case 'performance':
        return <PerformanceAnalysisView />;
      case 'correlation':
        return <CorrelationExplorerView />;
      case 'atRisk':
        return <AtRiskStudentsView />;
      case 'interventions':
        return <EarlyInterventionView />;
      case 'comparison':
        return <StudentComparisonView />;
      case 'simulator':
        return <PerformanceSimulatorView />;
      case 'segmentation':
        return <StudentSegmentationView />;
      case 'department':
        return <DepartmentAnalyticsView />;
      case 'council':
        return <AcademicCouncilView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 flex flex-col min-w-0 ${
        isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        <Header isCollapsed={isCollapsed} />
        <main className="flex-1 pb-16">
          {renderContent()}
        </main>
      </div>

      {/* Global Student Profile Modal - Ensures eye button works seamlessly everywhere */}
      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={closeStudentProfile}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
