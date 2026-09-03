// Data Science & Analytics Math Engine for EduPulse AI

/**
 * Calculates basic statistics: mean, median, min, max, stdDev
 */
export const calculateStats = (numbers) => {
  const valid = numbers.filter(n => typeof n === 'number' && !isNaN(n));
  if (valid.length === 0) {
    return { mean: 0, median: 0, min: 0, max: 0, stdDev: 0, count: 0 };
  }

  const sum = valid.reduce((acc, curr) => acc + curr, 0);
  const mean = sum / valid.length;

  const sorted = [...valid].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  const variance = valid.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) / valid.length;
  const stdDev = Math.sqrt(variance);

  return {
    mean: Number(mean.toFixed(2)),
    median: Number(median.toFixed(2)),
    min: Number(min.toFixed(2)),
    max: Number(max.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    count: valid.length
  };
};

/**
 * Computes Pearson Correlation Coefficient (r) between two numeric arrays
 */
export const calculateCorrelation = (xArr, yArr) => {
  const paired = [];
  for (let i = 0; i < Math.min(xArr.length, yArr.length); i++) {
    const x = Number(xArr[i]);
    const y = Number(yArr[i]);
    if (!isNaN(x) && x !== null && !isNaN(y) && y !== null) {
      paired.push({ x, y });
    }
  }

  const n = paired.length;
  if (n < 2) return { r: 0, r2: 0, strength: "Insufficient Data", interpretation: "Not enough valid paired data points." };

  const sumX = paired.reduce((acc, p) => acc + p.x, 0);
  const sumY = paired.reduce((acc, p) => acc + p.y, 0);
  const sumX2 = paired.reduce((acc, p) => acc + p.x * p.x, 0);
  const sumY2 = paired.reduce((acc, p) => acc + p.y * p.y, 0);
  const sumXY = paired.reduce((acc, p) => acc + p.x * p.y, 0);

  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (den === 0) return { r: 0, r2: 0, strength: "No Variance", interpretation: "One or both variables have zero variance." };

  const r = num / den;
  const r2 = r * r;

  const absR = Math.abs(r);
  let strength = "";
  if (absR >= 0.7) strength = r > 0 ? "Strong Positive" : "Strong Negative";
  else if (absR >= 0.4) strength = r > 0 ? "Moderate Positive" : "Moderate Negative";
  else if (absR >= 0.2) strength = r > 0 ? "Weak Positive" : "Weak Negative";
  else strength = "Negligible / No Correlation";

  let interpretation = "";
  if (r >= 0.7) interpretation = "Strong direct relationship: higher values in the first variable strongly correspond with higher values in the second.";
  else if (r >= 0.4) interpretation = "Moderate positive relationship: an increase in the first variable generally accompanies an increase in the second.";
  else if (r >= 0.2) interpretation = "Slight positive trend, though individual performance varies significantly.";
  else if (r <= -0.4) interpretation = "Inverse relationship: higher values in the first variable correspond with lower values in the second.";
  else interpretation = "No meaningful linear dependency detected between these two factors.";

  return {
    r: Number(r.toFixed(3)),
    r2: Number(r2.toFixed(3)),
    strength,
    interpretation,
    sampleSize: n
  };
};

/**
 * Computes overall academic score (0-100) for a student record
 */
export const calculateOverallScore = (student) => {
  const att = Number(student.Attendance) || 0;
  const internal = Number(student.Internal_Marks) || 0;
  const assign = Number(student.Assignment_Score) || 0;
  const curr = Number(student.Current_Semester_Marks) || 0;

  // Composite formula: 40% Current Marks, 25% Internal, 20% Assignment, 15% Attendance
  const score = (curr * 0.40) + (internal * 0.25) + (assign * 0.20) + (att * 0.15);
  return Number(Math.min(100, Math.max(0, score)).toFixed(1));
};

/**
 * Risk Scoring Engine
 * Default weights:
 * Attendance: 30%
 * Internal Marks: 25%
 * Assignment Score: 20%
 * Previous Performance: 15%
 * Performance Trend: 10%
 */
export const DEFAULT_RISK_WEIGHTS = {
  attendance: 30,
  internalMarks: 25,
  assignmentScore: 20,
  previousPerformance: 15,
  performanceTrend: 10
};

export const calculateRiskScore = (student, weights = DEFAULT_RISK_WEIGHTS) => {
  const att = Number(student.Attendance) || 0;
  const internal = Number(student.Internal_Marks) || 0;
  const assign = Number(student.Assignment_Score) || 0;
  const prev = Number(student.Previous_Semester_Marks) || 0;
  const curr = Number(student.Current_Semester_Marks) || 0;

  // Sub-risk components (0-100, 100 being worst/highest risk)
  const attRisk = Math.max(0, 100 - att);
  const internalRisk = Math.max(0, 100 - internal);
  const assignRisk = Math.max(0, 100 - assign);
  const prevRisk = Math.max(0, 100 - prev);

  // Trend risk: If current < previous, risk increases proportionately
  const diff = prev - curr;
  const trendRisk = Math.min(100, Math.max(0, (diff + 20) * 2.5)); // scaled 0 to 100

  const totalWeight = (weights.attendance + weights.internalMarks + weights.assignmentScore + weights.previousPerformance + weights.performanceTrend) || 100;

  const score = (
    (attRisk * weights.attendance) +
    (internalRisk * weights.internalMarks) +
    (assignRisk * weights.assignmentScore) +
    (prevRisk * weights.previousPerformance) +
    (trendRisk * weights.performanceTrend)
  ) / totalWeight;

  return Number(Math.min(100, Math.max(0, score)).toFixed(1));
};

export const getRiskCategory = (riskScore) => {
  if (riskScore >= 80) return { category: "Critical", color: "bg-red-500 text-white", badgeColor: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300", level: 4 };
  if (riskScore >= 60) return { category: "High", color: "bg-orange-500 text-white", badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300", level: 3 };
  if (riskScore >= 30) return { category: "Moderate", color: "bg-amber-500 text-white", badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300", level: 2 };
  return { category: "Low", color: "bg-emerald-500 text-white", badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300", level: 1 };
};

export const getPerformanceTrend = (student) => {
  const prev = Number(student.Previous_Semester_Marks) || 0;
  const curr = Number(student.Current_Semester_Marks) || 0;
  const diff = curr - prev;

  if (diff >= 3) return { trend: "Improving", symbol: "↑", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 text-emerald-700" };
  if (diff <= -3) return { trend: "Declining", symbol: "↓", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 text-red-700" };
  return { trend: "Stable", symbol: "→", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 text-blue-700" };
};

/**
 * Performs rule-based student segmentation into 7 distinct cohorts
 */
export const performSegmentation = (students, weights = DEFAULT_RISK_WEIGHTS) => {
  const segments = {
    "High Performers": [],
    "Consistent Performers": [],
    "Attendance Risk": [],
    "Assignment Risk": [],
    "Improving Students": [],
    "Declining Students": [],
    "Critical Support Group": []
  };

  students.forEach(student => {
    const overall = calculateOverallScore(student);
    const riskScore = calculateRiskScore(student, weights);
    const att = Number(student.Attendance) || 0;
    const assign = Number(student.Assignment_Score) || 0;
    const prev = Number(student.Previous_Semester_Marks) || 0;
    const curr = Number(student.Current_Semester_Marks) || 0;

    if (riskScore >= 75 || (att < 55 && overall < 55)) {
      segments["Critical Support Group"].push(student);
    } else if (att < 70) {
      segments["Attendance Risk"].push(student);
    } else if (assign < 60) {
      segments["Assignment Risk"].push(student);
    } else if (curr - prev >= 5) {
      segments["Improving Students"].push(student);
    } else if (prev - curr >= 5) {
      segments["Declining Students"].push(student);
    } else if (overall >= 82) {
      segments["High Performers"].push(student);
    } else {
      segments["Consistent Performers"].push(student);
    }
  });

  return segments;
};

/**
 * Predicts student performance and risk level based on "What-If" scenario sliders
 */
export const predictPerformance = (student, deltaAtt, deltaInternal, deltaAssign, weights = DEFAULT_RISK_WEIGHTS) => {
  const origAtt = Number(student.Attendance) || 0;
  const origInternal = Number(student.Internal_Marks) || 0;
  const origAssign = Number(student.Assignment_Score) || 0;

  const simAtt = Math.min(100, Math.max(0, origAtt + deltaAtt));
  const simInternal = Math.min(100, Math.max(0, origInternal + deltaInternal));
  const simAssign = Math.min(100, Math.max(0, origAssign + deltaAssign));

  // Current state
  const origScore = calculateOverallScore(student);
  const origRisk = calculateRiskScore(student, weights);

  // Simulated record
  const simStudent = {
    ...student,
    Attendance: simAtt,
    Internal_Marks: simInternal,
    Assignment_Score: simAssign,
    Current_Semester_Marks: Math.min(100, Math.max(0, student.Current_Semester_Marks + (deltaAtt * 0.15 + deltaInternal * 0.2 + deltaAssign * 0.15)))
  };

  const predictedScore = calculateOverallScore(simStudent);
  const predictedRisk = calculateRiskScore(simStudent, weights);

  return {
    current: { score: origScore, riskScore: origRisk, category: getRiskCategory(origRisk) },
    predicted: { score: predictedScore, riskScore: predictedRisk, category: getRiskCategory(predictedRisk) },
    deltaScore: Number((predictedScore - origScore).toFixed(1)),
    deltaRisk: Number((predictedRisk - origRisk).toFixed(1)),
    simValues: { attendance: simAtt, internal: simInternal, assignment: simAssign }
  };
};

/**
 * Dynamic AI Insights Generator: Analyzes the actual dataset and outputs empirical insights
 */
export const generateAIInsights = (students, weights = DEFAULT_RISK_WEIGHTS) => {
  if (!students || students.length === 0) return [];

  const validStudents = students.filter(s => s.Attendance !== null && s.Internal_Marks !== null);
  const insights = [];

  // Insight 1: Attendance vs Performance Correlation
  const attList = validStudents.map(s => Number(s.Attendance));
  const perfList = validStudents.map(s => calculateOverallScore(s));
  const attCorr = calculateCorrelation(attList, perfList);

  if (attCorr.r >= 0.5) {
    insights.push({
      id: "att-perf-corr",
      severity: "Warning",
      title: "Strong Attendance-Performance Dependency",
      text: `Empirical analysis yields a correlation coefficient r = ${attCorr.r} between Attendance % and Overall Score. Attendance below 75% dramatically raises the likelihood of academic deficit.`,
      metric: `r = ${attCorr.r} (${attCorr.strength})`
    });
  }

  // Insight 2: Low Attendance threshold group
  const lowAttCount = validStudents.filter(s => Number(s.Attendance) < 70).length;
  const lowAttLowPerfCount = validStudents.filter(s => Number(s.Attendance) < 70 && calculateOverallScore(s) < 60).length;
  const lowAttPercentage = Math.round((lowAttLowPerfCount / Math.max(1, lowAttCount)) * 100);

  if (lowAttCount > 0) {
    insights.push({
      id: "low-att-group",
      severity: "Critical",
      title: "Attendance At-Risk Cohort",
      text: `${lowAttCount} students have attendance below 70%. Out of these, ${lowAttPercentage}% (${lowAttLowPerfCount} students) fall into the below-average academic performance group.`,
      metric: `${lowAttCount} Students At Risk`
    });
  }

  // Insight 3: Assignment consistency vs Internal Marks
  const assignList = validStudents.map(s => Number(s.Assignment_Score));
  const internalList = validStudents.map(s => Number(s.Internal_Marks));
  const assignInternalCorr = calculateCorrelation(assignList, internalList);

  insights.push({
    id: "assign-internal-link",
    severity: "Positive",
    title: "Assignment Consistency Driver",
    text: `Assignment submission consistency positively correlates with internal test performance (r = ${assignInternalCorr.r}). High assignment completion acts as an early indicator of exam readiness.`,
    metric: `r = ${assignInternalCorr.r}`
  });

  // Insight 4: Declining Trend Alert
  const decliningCount = validStudents.filter(s => (Number(s.Previous_Semester_Marks) - Number(s.Current_Semester_Marks)) >= 5).length;
  if (decliningCount > 0) {
    insights.push({
      id: "declining-trend",
      severity: "Warning",
      title: "Negative Momentum Alert",
      text: `${decliningCount} students have experienced a drop of 5% or more in current semester scores relative to previous semester records, indicating a need for early academic counseling.`,
      metric: `${decliningCount} Declining Students`
    });
  }

  // Insight 5: Department comparison insight
  const depts = ["CSE", "ECE", "EEE", "MECH", "CIVIL"];
  const deptAvgs = depts.map(dept => {
    const deptStudents = validStudents.filter(s => s.Department === dept);
    const avgScore = calculateStats(deptStudents.map(s => calculateOverallScore(s))).mean;
    return { dept, avgScore, count: deptStudents.length };
  }).filter(d => d.count > 0);

  if (deptAvgs.length > 1) {
    deptAvgs.sort((a, b) => b.avgScore - a.avgScore);
    const topDept = deptAvgs[0];
    const bottomDept = deptAvgs[deptAvgs.length - 1];

    insights.push({
      id: "dept-variance",
      severity: "Informational",
      title: "Department Performance Variance",
      text: `${topDept.dept} department leads in average overall academic performance (${topDept.avgScore}%), while ${bottomDept.dept} department shows the highest potential area for targeted intervention (${bottomDept.avgScore}%).`,
      metric: `Top: ${topDept.dept}`
    });
  }

  return insights;
};
