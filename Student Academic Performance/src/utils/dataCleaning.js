// Client-side Data Cleaning & Quality Audit Utilities for EduPulse AI
import { calculateStats } from './dataScience';

/**
 * Evaluates Data Quality Score (0-100) and produces defect metrics
 */
export const auditDataQuality = (dataset) => {
  if (!dataset || dataset.length === 0) {
    return {
      qualityScore: 100,
      totalRecords: 0,
      missingCount: 0,
      duplicateCount: 0,
      invalidAttendanceCount: 0,
      invalidMarksCount: 0,
      cleanRecordCount: 0,
      defects: []
    };
  }

  const total = dataset.length;
  let missingCount = 0;
  let invalidAttendanceCount = 0;
  let invalidMarksCount = 0;
  const defects = [];

  // Track duplicate IDs
  const idCounts = {};
  dataset.forEach(row => {
    const id = row.Student_ID;
    if (id) {
      idCounts[id] = (idCounts[id] || 0) + 1;
    }
  });

  let duplicateCount = 0;
  Object.keys(idCounts).forEach(id => {
    if (idCounts[id] > 1) {
      duplicateCount += (idCounts[id] - 1);
    }
  });

  dataset.forEach((row, idx) => {
    const rowNum = idx + 1;
    // Missing values check
    if (row.Attendance === null || row.Attendance === undefined || row.Attendance === "" ||
        row.Internal_Marks === null || row.Internal_Marks === undefined || row.Internal_Marks === "" ||
        row.Assignment_Score === null || row.Assignment_Score === undefined || row.Assignment_Score === "" ||
        row.Previous_Semester_Marks === null || row.Previous_Semester_Marks === undefined || row.Previous_Semester_Marks === "") {
      missingCount++;
      defects.push({ row: rowNum, studentId: row.Student_ID, type: "Missing Value", detail: "One or more required academic fields are empty." });
    }

    // Range checks
    const att = Number(row.Attendance);
    if (!isNaN(att) && (att < 0 || att > 100)) {
      invalidAttendanceCount++;
      defects.push({ row: rowNum, studentId: row.Student_ID, type: "Invalid Attendance", detail: `Attendance value (${att}%) is outside valid 0-100 range.` });
    }

    const internal = Number(row.Internal_Marks);
    if (!isNaN(internal) && (internal < 0 || internal > 100)) {
      invalidMarksCount++;
      defects.push({ row: rowNum, studentId: row.Student_ID, type: "Invalid Marks", detail: `Internal mark (${internal}) is outside valid 0-100 range.` });
    }
  });

  // Calculate score penalty
  const missingPenalty = (missingCount / total) * 35;
  const duplicatePenalty = (duplicateCount / total) * 35;
  const invalidAttPenalty = (invalidAttendanceCount / total) * 15;
  const invalidMarksPenalty = (invalidMarksCount / total) * 15;

  const rawScore = 100 - (missingPenalty + duplicatePenalty + invalidAttPenalty + invalidMarksPenalty);
  const qualityScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  return {
    qualityScore,
    totalRecords: total,
    missingCount,
    duplicateCount,
    invalidAttendanceCount,
    invalidMarksCount,
    cleanRecordCount: Math.max(0, total - missingCount - duplicateCount - invalidAttendanceCount - invalidMarksCount),
    defects
  };
};

/**
 * Removes duplicate student records keeping the first occurrence
 */
export const removeDuplicates = (dataset) => {
  const seen = new Set();
  const cleaned = [];
  let removedCount = 0;

  dataset.forEach(row => {
    if (!seen.has(row.Student_ID)) {
      seen.add(row.Student_ID);
      cleaned.push({ ...row });
    } else {
      removedCount++;
    }
  });

  return { cleaned, removedCount };
};

/**
 * Fixes out-of-range numerical values (caps at 0 and 100)
 */
export const fixInvalidRanges = (dataset) => {
  let fixedCount = 0;
  const cleaned = dataset.map(row => {
    const updated = { ...row };
    let modified = false;

    if (updated.Attendance !== null && updated.Attendance !== "") {
      const att = Number(updated.Attendance);
      if (att < 0 || att > 100) {
        updated.Attendance = Math.min(100, Math.max(0, att));
        modified = true;
      }
    }

    if (updated.Internal_Marks !== null && updated.Internal_Marks !== "") {
      const internal = Number(updated.Internal_Marks);
      if (internal < 0 || internal > 100) {
        updated.Internal_Marks = Math.min(100, Math.max(0, internal));
        modified = true;
      }
    }

    if (updated.Assignment_Score !== null && updated.Assignment_Score !== "") {
      const assign = Number(updated.Assignment_Score);
      if (assign < 0 || assign > 100) {
        updated.Assignment_Score = Math.min(100, Math.max(0, assign));
        modified = true;
      }
    }

    if (modified) fixedCount++;
    return updated;
  });

  return { cleaned, fixedCount };
};

/**
 * Imputes missing numeric values using Mean, Median, or Department-wise Mean strategy
 */
export const fillMissingValues = (dataset, strategy = "mean") => {
  const numericFields = ["Attendance", "Internal_Marks", "Assignment_Score", "Previous_Semester_Marks", "Current_Semester_Marks", "Extracurricular_Participation"];

  // Pre-calculate overall stats per field
  const overallStats = {};
  numericFields.forEach(field => {
    const values = dataset.map(d => Number(d[field])).filter(v => !isNaN(v) && v !== null && v !== "");
    overallStats[field] = calculateStats(values);
  });

  // Pre-calculate department-wise stats
  const deptStats = {};
  dataset.forEach(d => {
    const dept = d.Department || "General";
    if (!deptStats[dept]) deptStats[dept] = {};
    numericFields.forEach(field => {
      if (!deptStats[dept][field]) deptStats[dept][field] = [];
      const val = Number(d[field]);
      if (!isNaN(val) && d[field] !== null && d[field] !== "") {
        deptStats[dept][field].push(val);
      }
    });
  });

  const deptComputed = {};
  Object.keys(deptStats).forEach(dept => {
    deptComputed[dept] = {};
    numericFields.forEach(field => {
      deptComputed[dept][field] = calculateStats(deptStats[dept][field]).mean;
    });
  });

  let imputedFieldCount = 0;
  let imputedRecordCount = 0;

  const cleaned = dataset.map(row => {
    const updated = { ...row };
    let recordImputed = false;

    numericFields.forEach(field => {
      if (updated[field] === null || updated[field] === undefined || updated[field] === "") {
        imputedFieldCount++;
        recordImputed = true;

        if (strategy === "department_mean") {
          const dept = updated.Department || "General";
          updated[field] = Math.round(deptComputed[dept]?.[field] || overallStats[field].mean || 70);
        } else if (strategy === "median") {
          updated[field] = Math.round(overallStats[field].median || 70);
        } else { // default mean
          updated[field] = Math.round(overallStats[field].mean || 70);
        }
      }
    });

    if (recordImputed) imputedRecordCount++;
    return updated;
  });

  return { cleaned, imputedRecordCount, imputedFieldCount };
};

/**
 * Full Pipeline Data Cleaner
 */
export const cleanDataset = (dataset, fillStrategy = "mean") => {
  const logs = [];
  logs.push({ timestamp: new Date().toLocaleTimeString(), action: "Data Cleaning Started", detail: `Executing pipeline with strategy '${fillStrategy}' on ${dataset.length} records.` });

  // Step 1: Remove Duplicates
  const dupResult = removeDuplicates(dataset);
  if (dupResult.removedCount > 0) {
    logs.push({ timestamp: new Date().toLocaleTimeString(), action: "Removed Duplicate Records", detail: `Purged ${dupResult.removedCount} duplicate Student ID records.` });
  }

  // Step 2: Fix Range Extremes
  const rangeResult = fixInvalidRanges(dupResult.cleaned);
  if (rangeResult.fixedCount > 0) {
    logs.push({ timestamp: new Date().toLocaleTimeString(), action: "Bounded Invalid Range Values", detail: `Corrected ${rangeResult.fixedCount} out-of-bound values (capped between 0 and 100).` });
  }

  // Step 3: Impute Missing Values
  const imputeResult = fillMissingValues(rangeResult.cleaned, fillStrategy);
  if (imputeResult.imputedRecordCount > 0) {
    logs.push({ timestamp: new Date().toLocaleTimeString(), action: "Imputed Missing Values", detail: `Filled ${imputeResult.imputedFieldCount} missing attributes across ${imputeResult.imputedRecordCount} student records using ${fillStrategy} calculation.` });
  }

  logs.push({ timestamp: new Date().toLocaleTimeString(), action: "Cleaning Pipeline Completed", detail: `Dataset cleaned successfully. Final record count: ${imputeResult.cleaned.length}.` });

  return {
    cleanedData: imputeResult.cleaned,
    logs
  };
};
