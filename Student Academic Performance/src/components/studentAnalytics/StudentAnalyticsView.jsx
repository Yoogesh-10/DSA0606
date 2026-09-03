import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  calculateOverallScore,
  calculateRiskScore,
  getRiskCategory,
  getPerformanceTrend
} from '../../utils/dataScience';
import { StudentProfileModal } from '../profile/StudentProfileModal';
import {
  Search,
  Filter,
  ArrowUpDown,
  User,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

export const StudentAnalyticsView = () => {
  const {
    filteredDataset,
    riskWeights,
    selectedStudent,
    openStudentProfile,
    closeStudentProfile
  } = useApp();

  const [sortField, setSortField] = useState('overallScore');
  const [sortOrder, setSortOrder] = useState('desc');
  const [attFilter, setAttFilter] = useState('All');
  const [perfFilter, setPerfFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Process sorting and additional table-level sub-filters
  const processedDataset = useMemo(() => {
    let result = filteredDataset.map(s => {
      const overallScore = calculateOverallScore(s);
      const riskScore = calculateRiskScore(s, riskWeights);
      const categoryInfo = getRiskCategory(riskScore);
      const trendInfo = getPerformanceTrend(s);
      return {
        ...s,
        overallScore,
        riskScore,
        riskCategory: categoryInfo.category,
        trend: trendInfo.trend,
        trendSymbol: trendInfo.symbol
      };
    });

    // Attendance range filter
    if (attFilter === '<70') result = result.filter(s => (Number(s.Attendance) || 0) < 70);
    else if (attFilter === '70-85') result = result.filter(s => (Number(s.Attendance) || 0) >= 70 && (Number(s.Attendance) || 0) <= 85);
    else if (attFilter === '>85') result = result.filter(s => (Number(s.Attendance) || 0) > 85);

    // Performance range filter
    if (perfFilter === 'Critical') result = result.filter(s => s.overallScore < 50);
    else if (perfFilter === 'Average') result = result.filter(s => s.overallScore >= 50 && s.overallScore <= 75);
    else if (perfFilter === 'High') result = result.filter(s => s.overallScore > 75);

    // Sorting logic
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? (valA - valB) : (valB - valA);
    });

    return result;
  }, [filteredDataset, riskWeights, sortField, sortOrder, attFilter, perfFilter]);

  const totalPages = Math.ceil(processedDataset.length / itemsPerPage) || 1;
  const paginatedData = processedDataset.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Table Control Bar */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Student Academic Directory ({processedDataset.length} Students)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Search, filter, and inspect multi-factor academic risk profiles
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Attendance Range */}
            <select
              value={attFilter}
              onChange={(e) => { setAttFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="All">Attendance: All</option>
              <option value="<70">&lt; 70% (At-Risk)</option>
              <option value="70-85">70% – 85%</option>
              <option value=">85">&gt; 85% (High)</option>
            </select>

            {/* Performance Range */}
            <select
              value={perfFilter}
              onChange={(e) => { setPerfFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="All">Overall Score: All</option>
              <option value="Critical">Critical (&lt; 50%)</option>
              <option value="Average">Average (50–75%)</option>
              <option value="High">High (&gt; 75%)</option>
            </select>

            {/* CSV Export */}
            <button
              onClick={() => exportToCSV('EduPulse_Student_Directory.csv', processedDataset)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Roster Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold uppercase">
              <tr>
                <th className="p-3.5 cursor-pointer" onClick={() => handleSort('Student_ID')}>
                  <div className="flex items-center space-x-1">
                    <span>Student ID</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="p-3.5 cursor-pointer" onClick={() => handleSort('Student_Name')}>
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="p-3.5">Dept / Sem</th>
                <th className="p-3.5 text-right cursor-pointer" onClick={() => handleSort('Attendance')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Attendance</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="p-3.5 text-right cursor-pointer" onClick={() => handleSort('Internal_Marks')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Internal</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="p-3.5 text-right cursor-pointer" onClick={() => handleSort('Assignment_Score')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Assignment</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="p-3.5 text-right cursor-pointer" onClick={() => handleSort('overallScore')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Overall Score</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="p-3.5 text-center cursor-pointer" onClick={() => handleSort('riskScore')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>Risk Level</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="p-3.5 text-center">Trend</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-slate-400">
                    No students match the selected global or local filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedData.map((s) => {
                  const riskInfo = getRiskCategory(s.riskScore);
                  return (
                    <tr
                      key={s.Student_ID}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                      onClick={() => openStudentProfile(s)}
                    >
                      <td className="p-3.5 font-bold text-brand-600 dark:text-brand-400">{s.Student_ID}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{s.Student_Name}</td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{s.Department}</span>
                        <span className="text-[10px] text-slate-400 ml-1">S{s.Semester}</span>
                      </td>
                      <td className={`p-3.5 text-right font-bold ${Number(s.Attendance) < 75 ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}`}>
                        {s.Attendance}%
                      </td>
                      <td className="p-3.5 text-right font-semibold">{s.Internal_Marks}</td>
                      <td className="p-3.5 text-right font-semibold">{s.Assignment_Score}</td>
                      <td className="p-3.5 text-right font-black text-slate-900 dark:text-white">{s.overallScore}%</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-0.5 text-[11px] font-extrabold rounded-full ${riskInfo.badgeColor}`}>
                          {s.riskCategory} ({s.riskScore})
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`font-bold ${s.trend === 'Improving' ? 'text-emerald-600' : s.trend === 'Declining' ? 'text-red-500' : 'text-blue-500'}`}>
                          {s.trendSymbol} {s.trend}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); openStudentProfile(s); }}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500">
            Showing Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of {totalPages}
          </span>

          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 disabled:opacity-40 font-bold transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 disabled:opacity-40 font-bold transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Student Profile Modal */}
      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={closeStudentProfile}
        />
      )}
    </div>
  );
};
