import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateCorrelation, calculateOverallScore } from '../../utils/dataScience';
import { Grid, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';

export const CorrelationExplorerView = () => {
  const { filteredDataset } = useApp();

  const variables = [
    { key: 'Attendance', label: 'Attendance %', getter: s => Number(s.Attendance) },
    { key: 'Internal_Marks', label: 'Internal Marks', getter: s => Number(s.Internal_Marks) },
    { key: 'Assignment_Score', label: 'Assignment Score', getter: s => Number(s.Assignment_Score) },
    { key: 'Previous_Semester_Marks', label: 'Prev Semester', getter: s => Number(s.Previous_Semester_Marks) },
    { key: 'Current_Semester_Marks', label: 'Curr Semester', getter: s => Number(s.Current_Semester_Marks) },
    { key: 'Extracurricular_Participation', label: 'Extracurricular', getter: s => Number(s.Extracurricular_Participation) },
    { key: 'Overall_Score', label: 'Overall Score', getter: s => calculateOverallScore(s) }
  ];

  const [selectedCell, setSelectedCell] = useState({ varAIndex: 0, varBIndex: 1 });

  // Compute 7x7 Pearson Correlation Matrix dynamically from current filtered dataset
  const matrix = useMemo(() => {
    const validStudents = filteredDataset.filter(s => s.Attendance !== null && s.Internal_Marks !== null);

    return variables.map((varA, rowIdx) => {
      const arrA = validStudents.map(s => varA.getter(s));
      return variables.map((varB, colIdx) => {
        const arrB = validStudents.map(s => varB.getter(s));
        return calculateCorrelation(arrA, arrB);
      });
    });
  }, [filteredDataset]);

  const activeVarA = variables[selectedCell.varAIndex];
  const activeVarB = variables[selectedCell.varBIndex];
  const activeCorr = matrix[selectedCell.varAIndex][selectedCell.varBIndex];

  // Helper color map for matrix heatmap cells
  const getCellBg = (r, isDiagonal) => {
    if (isDiagonal) return 'bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold';
    const abs = Math.abs(r);
    if (r >= 0.7) return 'bg-emerald-600 text-white font-black';
    if (r >= 0.5) return 'bg-emerald-500 text-white font-bold';
    if (r >= 0.3) return 'bg-brand-500 text-white font-semibold';
    if (r >= 0.1) return 'bg-brand-100 text-brand-900 dark:bg-brand-950 dark:text-brand-200 font-medium';
    if (r <= -0.3) return 'bg-red-500 text-white font-bold';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
          <Grid className="w-5 h-5 text-brand-600" />
          <span>Interactive 7×7 Correlation Matrix & Heatmap</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Click any cell in the heatmap matrix to inspect pairwise variable dependencies, correlation strength, and text interpretation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap Matrix Table */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead>
              <tr>
                <th className="p-2 text-left text-slate-400 font-bold">Variables</th>
                {variables.map((v, idx) => (
                  <th key={idx} className="p-2 font-bold text-slate-700 dark:text-slate-300 rotate-[-25deg] origin-bottom-left max-w-[70px] truncate">
                    {v.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {variables.map((varA, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="p-2 font-bold text-slate-900 dark:text-white text-left whitespace-nowrap">
                    {varA.label}
                  </td>
                  {variables.map((varB, colIdx) => {
                    const corr = matrix[rowIdx][colIdx];
                    const isSelected = selectedCell.varAIndex === rowIdx && selectedCell.varBIndex === colIdx;
                    const isDiag = rowIdx === colIdx;

                    return (
                      <td key={colIdx} className="p-1">
                        <button
                          onClick={() => setSelectedCell({ varAIndex: rowIdx, varBIndex: colIdx })}
                          className={`w-full py-3 px-1 rounded-xl transition-all ${getCellBg(corr.r, isDiag)} ${
                            isSelected ? 'ring-4 ring-brand-400 scale-105 shadow-lg z-10' : 'hover:scale-105'
                          }`}
                        >
                          {corr.r}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Color Legend */}
          <div className="flex items-center justify-center space-x-4 pt-6 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center space-x-1.5"><span className="w-3 h-3 rounded bg-emerald-600" /><span>Strong Pos (≥0.7)</span></div>
            <div className="flex items-center space-x-1.5"><span className="w-3 h-3 rounded bg-brand-500" /><span>Mod Pos (0.3–0.6)</span></div>
            <div className="flex items-center space-x-1.5"><span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-800" /><span>Neutral / Negligible</span></div>
            <div className="flex items-center space-x-1.5"><span className="w-3 h-3 rounded bg-red-500" /><span>Negative (&lt;-0.3)</span></div>
          </div>
        </div>

        {/* Dynamic Cell Detail Inspector */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white rounded-3xl shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-brand-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Cell Detail Inspector</span>
            </div>

            <div className="p-4 bg-white/10 rounded-2xl border border-white/15 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Variable A:</span>
                <span className="font-extrabold text-white">{activeVarA.label}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Variable B:</span>
                <span className="font-extrabold text-white">{activeVarB.label}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/15">
                <span className="text-[10px] text-slate-300 uppercase font-semibold">Pearson r</span>
                <p className="text-3xl font-black text-white mt-1">{activeCorr.r}</p>
              </div>

              <div className="p-4 bg-white/10 rounded-2xl border border-white/15">
                <span className="text-[10px] text-slate-300 uppercase font-semibold">Variance (r²)</span>
                <p className="text-3xl font-black text-brand-300 mt-1">{activeCorr.r2}</p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Relationship Strength</span>
              <p className="text-sm font-extrabold text-emerald-300">{activeCorr.strength}</p>
            </div>

            <div className="p-4 bg-white/10 rounded-2xl border border-white/15 space-y-1">
              <span className="text-xs font-bold text-brand-300">Interpretation:</span>
              <p className="text-xs text-slate-200 leading-relaxed">{activeCorr.interpretation}</p>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs space-y-1">
            <span className="font-bold text-amber-400">Key Takeaway for Faculty:</span>
            <p className="text-slate-300">
              {activeCorr.r >= 0.5 ? "Interventions improving Variable A will have a direct positive ripple effect on Variable B." : "Independent factor: strategy should address both variables separately."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
