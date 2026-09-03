import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { INITIAL_DATASET } from '../utils/mockData';
import { auditDataQuality, cleanDataset } from '../utils/dataCleaning';
import { DEFAULT_RISK_WEIGHTS, calculateRiskScore, getRiskCategory } from '../utils/dataScience';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [rawDataset, setRawDataset] = useState(INITIAL_DATASET);
  const [dataset, setDataset] = useState(INITIAL_DATASET);
  const [cleaningLogs, setCleaningLogs] = useState([]);
  const [isDataCleaned, setIsDataCleaned] = useState(false);

  const [activeTab, setActiveTab] = useState('landing');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Configurable Risk Weights
  const [riskWeights, setRiskWeights] = useState(DEFAULT_RISK_WEIGHTS);

  // Global Filter State
  const [globalFilters, setGlobalFilters] = useState({
    academicYear: '2024-25',
    department: 'All',
    course: 'All',
    semester: 'All',
    riskLevel: 'All'
  });

  // Early Interventions State
  const [interventions, setInterventions] = useState([
    {
      id: "INT-101",
      studentId: "STU2025003",
      studentName: "Rohan Gupta",
      department: "EEE",
      riskScore: 78.4,
      mainFactor: "Attendance Below 50%",
      recommendedAction: "Attendance counseling & Mandatory Parent Conference",
      assignedFaculty: "Dr. S. Raman",
      priority: "Critical",
      status: "In Progress",
      assignedDate: "2025-02-15",
      notes: "Student cited health issues. Medical certificate pending."
    },
    {
      id: "INT-102",
      studentId: "STU2025015",
      studentName: "Karan Singh",
      department: "CSE",
      riskScore: 72.1,
      mainFactor: "Low Assignment Completion",
      recommendedAction: "Peer tutoring & Assignment Deadline Plan",
      assignedFaculty: "Prof. Ananya V.",
      priority: "High",
      status: "Pending",
      assignedDate: "2025-02-18",
      notes: "First notice dispatched to student."
    },
    {
      id: "INT-103",
      studentId: "STU2025027",
      studentName: "Nikhil Bhatia",
      department: "MECH",
      riskScore: 68.9,
      mainFactor: "Internal Test Failure",
      recommendedAction: "Academic Mentoring in Fluid Mechanics",
      assignedFaculty: "Dr. K. Patel",
      priority: "High",
      status: "Completed",
      assignedDate: "2025-02-01",
      notes: "Completed 4 remedial classes. Retest score improved to 72%."
    }
  ]);

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Data Quality Defect Alert", message: "Initial raw dataset contains 5 missing values and 2 duplicate student IDs.", type: "warning", read: false, time: "10 mins ago" },
    { id: 2, title: "High-Risk Student Detected", message: "Rohan Gupta (STU2025003) risk score reached 78.4 (Critical).", type: "critical", read: false, time: "1 hour ago" },
    { id: 3, title: "Intervention Completed", message: "Mentoring program completed for Nikhil Bhatia (STU2025027).", type: "success", read: false, time: "1 day ago" }
  ]);

  // Handle Dark Mode DOM sync
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Calculate Data Quality Metrics
  const dataQuality = useMemo(() => auditDataQuality(rawDataset), [rawDataset]);

  // Perform Dataset Cleaning Action
  const handleCleanDataset = (strategy = "mean") => {
    const { cleanedData, logs } = cleanDataset(rawDataset, strategy);
    setDataset(cleanedData);
    setCleaningLogs(logs);
    setIsDataCleaned(true);
    setNotifications(prev => [
      { id: Date.now(), title: "Dataset Cleaned", message: `Data cleaning completed with '${strategy}' strategy. Quality score updated.`, type: "success", read: false, time: "Just now" },
      ...prev
    ]);
  };

  // Reset to initial raw dataset
  const resetToSampleDataset = () => {
    setRawDataset(INITIAL_DATASET);
    setDataset(INITIAL_DATASET);
    setIsDataCleaned(false);
    setCleaningLogs([]);
  };

  // Upload dataset parser handler
  const handleFileUpload = (newRawData) => {
    setRawDataset(newRawData);
    setDataset(newRawData);
    setIsDataCleaned(false);
    setCleaningLogs([]);
    setNotifications(prev => [
      { id: Date.now(), title: "New File Uploaded", message: `Uploaded ${newRawData.length} student records into the pipeline.`, type: "info", read: false, time: "Just now" },
      ...prev
    ]);
  };

  // Filtered dataset derived dynamically
  const filteredDataset = useMemo(() => {
    return dataset.filter(student => {
      // Department filter
      if (globalFilters.department !== 'All' && student.Department !== globalFilters.department) return false;

      // Course filter
      if (globalFilters.course !== 'All' && student.Course !== globalFilters.course) return false;

      // Semester filter
      if (globalFilters.semester !== 'All' && String(student.Semester) !== String(globalFilters.semester)) return false;

      // Risk level filter
      if (globalFilters.riskLevel !== 'All') {
        const riskScore = calculateRiskScore(student, riskWeights);
        const category = getRiskCategory(riskScore).category;
        if (category !== globalFilters.riskLevel) return false;
      }

      // Global Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = student.Student_Name?.toLowerCase().includes(q);
        const matchId = student.Student_ID?.toLowerCase().includes(q);
        const matchDept = student.Department?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchDept) return false;
      }

      return true;
    });
  }, [dataset, globalFilters, riskWeights, searchQuery]);

  // Intervention handlers
  const addIntervention = (newIntervention) => {
    setInterventions(prev => [newIntervention, ...prev]);
    setNotifications(prev => [
      { id: Date.now(), title: "Intervention Assigned", message: `Intervention for ${newIntervention.studentName} created.`, type: "info", read: false, time: "Just now" },
      ...prev
    ]);
  };

  const updateInterventionStatus = (id, newStatus, notes) => {
    setInterventions(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: newStatus, notes: notes || item.notes };
      }
      return item;
    }));
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider value={{
      rawDataset,
      dataset,
      filteredDataset,
      dataQuality,
      cleaningLogs,
      isDataCleaned,
      activeTab,
      setActiveTab,
      darkMode,
      toggleDarkMode,
      selectedStudent,
      setSelectedStudent,
      openStudentProfile: (st) => setSelectedStudent(st),
      closeStudentProfile: () => setSelectedStudent(null),
      globalFilters,
      setGlobalFilters,
      searchQuery,
      setSearchQuery,
      riskWeights,
      setRiskWeights,
      interventions,
      addIntervention,
      updateInterventionStatus,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      handleCleanDataset,
      resetToSampleDataset,
      handleFileUpload
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
