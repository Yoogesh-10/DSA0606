import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Trash2,
  Sliders,
  Check,
  ArrowRight,
  Database
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';
import { auditDataQuality } from '../../utils/dataCleaning';

export const DataUploadView = () => {
  const {
    rawDataset,
    dataset,
    dataQuality,
    cleaningLogs,
    isDataCleaned,
    handleCleanDataset,
    handleFileUpload,
    resetToSampleDataset
  } = useApp();

  const [missingStrategy, setMissingStrategy] = useState("mean");
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // File parsing logic
  const processFile = (file) => {
    setIsProcessing(true);
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            handleFileUpload(results.data);
          }
          setIsProcessing(false);
        },
        error: (err) => {
          alert("Error parsing CSV: " + err.message);
          setIsProcessing(false);
        }
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          if (json && json.length > 0) {
            handleFileUpload(json);
          }
        } catch (err) {
          alert("Error parsing Excel file: " + err.message);
        }
        setIsProcessing(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a valid CSV or Excel file (.csv, .xlsx, .xls)");
      setIsProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Post-cleaning quality score calculation
  const postCleaningQuality = isDataCleaned ? auditDataQuality(dataset) : null;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Upper Drag and Drop Upload Card */}
      <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Upload className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <span>Dataset Ingestion & File Dropzone</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports CSV and Excel (.xlsx). Expected columns: Student_ID, Student_Name, Attendance, Internal_Marks, Assignment_Score, etc.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={resetToSampleDataset}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Dataset</span>
            </button>
          </div>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            dragActive
              ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:border-brand-400'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">
            Drag & drop your CSV or Excel file here, or{' '}
            <label className="text-brand-600 dark:text-brand-400 hover:underline cursor-pointer">
              browse files
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Maximum recommended file size: 25MB • Up to 50,000 rows supported
          </p>
        </div>
      </div>

      {/* Data Quality Score Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quality Meter Card */}
        <div className="p-6 bg-gradient-to-br from-slate-900 to-brand-950 text-white rounded-3xl shadow-xl flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-300 uppercase tracking-widest">Data Quality Index</span>
            <span className={`px-2.5 py-1 text-xs font-extrabold rounded-full ${
              dataQuality.qualityScore >= 90 ? 'bg-emerald-500 text-white' :
              dataQuality.qualityScore >= 70 ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {dataQuality.qualityScore >= 90 ? 'HEALTHY' : dataQuality.qualityScore >= 70 ? 'NEEDS CLEANING' : 'CRITICAL DEFECTS'}
            </span>
          </div>

          <div className="text-center py-4">
            <div className="text-6xl font-black tracking-tight text-white">
              {dataQuality.qualityScore}<span className="text-2xl text-brand-300 font-normal">/100</span>
            </div>
            <p className="text-xs text-slate-300 mt-2 font-medium">
              Evaluated across {dataQuality.totalRecords} ingested student records
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden p-0.5 border border-white/15">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                dataQuality.qualityScore >= 90 ? 'bg-emerald-400' :
                dataQuality.qualityScore >= 70 ? 'bg-amber-400' : 'bg-red-500'
              }`}
              style={{ width: `${dataQuality.qualityScore}%` }}
            />
          </div>
        </div>

        {/* Defect Breakdown Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Missing Values</span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">{dataQuality.missingCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Empty academic fields</p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Duplicates</span>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">{dataQuality.duplicateCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Duplicate Student IDs</p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Invalid Attendance</span>
            <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-2">{dataQuality.invalidAttendanceCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Values outside 0–100%</p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Invalid Marks</span>
            <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-2">{dataQuality.invalidMarksCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Values outside valid range</p>
          </div>
        </div>
      </div>

      {/* Automatic Cleaning Control Panel */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-brand-600" />
              <span>Automated Client-Side Data Cleaning Pipeline</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select your missing value imputation strategy and execute the automated cleaning algorithm.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Imputation Strategy Selector */}
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-semibold px-2">Imputation:</span>
              <button
                onClick={() => setMissingStrategy('mean')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  missingStrategy === 'mean' ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Overall Mean
              </button>
              <button
                onClick={() => setMissingStrategy('median')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  missingStrategy === 'median' ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Median
              </button>
              <button
                onClick={() => setMissingStrategy('department_mean')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  missingStrategy === 'department_mean' ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Dept-Wise Mean
              </button>
            </div>

            {/* Execute Clean Button */}
            <button
              onClick={() => handleCleanDataset(missingStrategy)}
              className="px-6 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Clean Dataset Now</span>
            </button>

            {/* Download Clean Dataset */}
            <button
              onClick={() => exportToCSV('EduPulse_Cleaned_Students.csv', dataset)}
              className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Clean CSV</span>
            </button>
          </div>
        </div>

        {/* Before / After Quality Comparison */}
        {isDataCleaned && postCleaningQuality && (
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Cleaning Successfully Executed</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Data Quality improved from <span className="font-bold text-amber-600">{dataQuality.qualityScore}/100</span> to{' '}
                  <span className="font-bold text-emerald-600">{postCleaningQuality.qualityScore}/100</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs font-bold text-emerald-800 dark:text-emerald-200">
              <div>Removed Duplicates: <span className="text-emerald-600">{dataQuality.duplicateCount}</span></div>
              <div>Imputed Fields: <span className="text-emerald-600">{dataQuality.missingCount}</span></div>
            </div>
          </div>
        )}

        {/* Cleaning Activity Log */}
        {cleaningLogs.length > 0 && (
          <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl space-y-2 font-mono text-xs max-h-48 overflow-y-auto">
            <div className="text-[11px] font-bold text-brand-400 uppercase tracking-widest mb-1">Cleaning Audit Log Stream</div>
            {cleaningLogs.map((log, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <span className="text-slate-500">[{log.timestamp}]</span>
                <span className="text-emerald-400 font-bold">{log.action}:</span>
                <span className="text-slate-300">{log.detail}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raw Data Preview Table */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center space-x-2">
            <Database className="w-5 h-5 text-slate-400" />
            <span>Dataset Preview ({rawDataset.length} Records Ingested)</span>
          </h3>
          <span className="text-xs text-slate-400">Showing first 10 records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase">
              <tr>
                <th className="p-3">Student ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Dept</th>
                <th className="p-3">Sem</th>
                <th className="p-3 text-right">Attendance %</th>
                <th className="p-3 text-right">Internal Marks</th>
                <th className="p-3 text-right">Assignment</th>
                <th className="p-3 text-right">Extracurricular</th>
                <th className="p-3 text-right">Prev Sem</th>
                <th className="p-3 text-right">Curr Sem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {rawDataset.slice(0, 10).map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{row.Student_ID}</td>
                  <td className="p-3">{row.Student_Name}</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold">{row.Department}</span></td>
                  <td className="p-3">{row.Semester}</td>
                  <td className={`p-3 text-right font-bold ${row.Attendance === null || row.Attendance === "" ? 'text-red-500 font-black' : Number(row.Attendance) > 100 ? 'text-purple-600 font-black' : ''}`}>
                    {row.Attendance === null || row.Attendance === "" ? "MISSING" : `${row.Attendance}%`}
                  </td>
                  <td className={`p-3 text-right font-bold ${row.Internal_Marks === null ? 'text-red-500 font-black' : Number(row.Internal_Marks) < 0 ? 'text-purple-600 font-black' : ''}`}>
                    {row.Internal_Marks === null ? "MISSING" : row.Internal_Marks}
                  </td>
                  <td className="p-3 text-right">{row.Assignment_Score ?? <span className="text-red-500 font-bold">MISSING</span>}</td>
                  <td className="p-3 text-right">{row.Extracurricular_Participation}</td>
                  <td className="p-3 text-right">{row.Previous_Semester_Marks ?? <span className="text-red-500 font-bold">MISSING</span>}</td>
                  <td className="p-3 text-right font-bold text-brand-600 dark:text-brand-400">{row.Current_Semester_Marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
