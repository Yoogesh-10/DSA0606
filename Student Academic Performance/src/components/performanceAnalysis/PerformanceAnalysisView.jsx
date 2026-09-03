import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateCorrelation, calculateOverallScore } from '../../utils/dataScience';
import { LineChart, BarChart, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis } from 'recharts';
import { LineChart as LineIcon, Info, Sparkles, TrendingUp } from 'lucide-react';

export const PerformanceAnalysisView = () => {
  const { filteredDataset } = useApp();

  // Selected factor pair for detailed view
  const [selectedPair, setSelectedPair] = useState(0);

  const factorPairs = useMemo(() => {
    const valid = filteredDataset.filter(s => s.Attendance !== null && s.Internal_Marks !== null);

    const getValues = (getter) => valid.map(s => getter(s));

    const pairs = [
      {
        id: 0,
        title: "Attendance vs Internal Marks",
        xLabel: "Attendance %",
        yLabel: "Internal Marks",
        xKey: "att",
        yKey: "internal",
        data: valid.map(s => ({ x: Number(s.Attendance) || 0, y: Number(s.Internal_Marks) || 0, name: s.Student_Name })),
        corr: calculateCorrelation(getValues(s => Number(s.Attendance)), getValues(s => Number(s.Internal_Marks)))
      },
      {
        id: 1,
        title: "Attendance vs Assignment Score",
        xLabel: "Attendance %",
        yLabel: "Assignment Score",
        xKey: "att",
        yKey: "assign",
        data: valid.map(s => ({ x: Number(s.Attendance) || 0, y: Number(s.Assignment_Score) || 0, name: s.Student_Name })),
        corr: calculateCorrelation(getValues(s => Number(s.Attendance)), getValues(s => Number(s.Assignment_Score)))
      },
      {
        id: 2,
        title: "Attendance vs Overall Score",
        xLabel: "Attendance %",
        yLabel: "Overall Score",
        xKey: "att",
        yKey: "overall",
        data: valid.map(s => ({ x: Number(s.Attendance) || 0, y: calculateOverallScore(s), name: s.Student_Name })),
        corr: calculateCorrelation(getValues(s => Number(s.Attendance)), getValues(s => calculateOverallScore(s)))
      },
      {
        id: 3,
        title: "Assignment Score vs Overall Score",
        xLabel: "Assignment Score",
        yLabel: "Overall Score",
        xKey: "assign",
        yKey: "overall",
        data: valid.map(s => ({ x: Number(s.Assignment_Score) || 0, y: calculateOverallScore(s), name: s.Student_Name })),
        corr: calculateCorrelation(getValues(s => Number(s.Assignment_Score)), getValues(s => calculateOverallScore(s)))
      },
      {
        id: 4,
        title: "Internal Marks vs Overall Score",
        xLabel: "Internal Marks",
        yLabel: "Overall Score",
        xKey: "internal",
        yKey: "overall",
        data: valid.map(s => ({ x: Number(s.Internal_Marks) || 0, y: calculateOverallScore(s), name: s.Student_Name })),
        corr: calculateCorrelation(getValues(s => Number(s.Internal_Marks)), getValues(s => calculateOverallScore(s)))
      },
      {
        id: 5,
        title: "Previous vs Current Semester Marks",
        xLabel: "Previous Semester Marks",
        yLabel: "Current Semester Marks",
        xKey: "prev",
        yKey: "curr",
        data: valid.map(s => ({ x: Number(s.Previous_Semester_Marks) || 0, y: Number(s.Current_Semester_Marks) || 0, name: s.Student_Name })),
        corr: calculateCorrelation(getValues(s => Number(s.Previous_Semester_Marks)), getValues(s => Number(s.Current_Semester_Marks)))
      },
      {
        id: 6,
        title: "Extracurricular Participation vs Overall Score",
        xLabel: "Extracurricular Score",
        yLabel: "Overall Score",
        xKey: "extra",
        yKey: "overall",
        data: valid.map(s => ({ x: Number(s.Extracurricular_Participation) || 0, y: calculateOverallScore(s), name: s.Student_Name })),
        corr: calculateCorrelation(getValues(s => Number(s.Extracurricular_Participation)), getValues(s => calculateOverallScore(s)))
      }
    ];

    return pairs;
  }, [filteredDataset]);

  const activePair = factorPairs[selectedPair] || factorPairs[0];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header Selector Tabs */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <LineIcon className="w-5 h-5 text-brand-600" />
              <span>Exploratory Factor Analysis & Correlation Metrics</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select any bivariate factor pair to analyze scatter distributions and Pearson $r$ metrics.
            </p>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {factorPairs.map((pair) => (
            <button
              key={pair.id}
              onClick={() => setSelectedPair(pair.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedPair === pair.id
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {pair.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main EDA Visualizer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scatter Chart Area */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
              {activePair.title} Scatter Distribution
            </h4>
            <span className="text-xs font-bold text-slate-400">Sample size: {activePair.corr.sampleSize}</span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#94a3b8" />
                <XAxis type="number" dataKey="x" name={activePair.xLabel} stroke="#94a3b8" fontSize={11} />
                <YAxis type="number" dataKey="y" name={activePair.yLabel} stroke="#94a3b8" fontSize={11} />
                <ZAxis type="number" range={[40, 40]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl space-y-1">
                          <p className="font-bold">{data.name}</p>
                          <p className="text-slate-300">{activePair.xLabel}: <span className="font-bold text-brand-300">{data.x}</span></p>
                          <p className="text-slate-300">{activePair.yLabel}: <span className="font-bold text-emerald-300">{data.y}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Students" data={activePair.data} fill="#6366f1" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scientifically Formatted Correlation Card (Requirement 7) */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold text-brand-300 uppercase tracking-widest">Statistical Insight</span>
            </div>

            <h4 className="text-lg font-extrabold text-white">{activePair.title}</h4>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/15">
                <span className="text-[10px] text-slate-300 uppercase font-semibold">Pearson (r)</span>
                <p className="text-2xl font-black text-white mt-0.5">{activePair.corr.r}</p>
              </div>

              <div className="p-3 bg-white/10 rounded-2xl border border-white/15">
                <span className="text-[10px] text-slate-300 uppercase font-semibold">R-Squared (r²)</span>
                <p className="text-2xl font-black text-brand-300 mt-0.5">{activePair.corr.r2}</p>
              </div>
            </div>

            {/* Strength Badge */}
            <div className="pt-2">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Relationship Strength</span>
              <span className={`inline-block mt-1 px-3 py-1 text-xs font-extrabold rounded-full ${
                activePair.corr.r >= 0.6 ? 'bg-emerald-500 text-white' :
                activePair.corr.r >= 0.3 ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                {activePair.corr.strength}
              </span>
            </div>

            {/* Interpretation */}
            <div className="p-4 bg-white/10 rounded-2xl border border-white/15 space-y-1">
              <span className="text-xs font-bold text-brand-300 block">Interpretation:</span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {activePair.corr.interpretation}
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-white/10">
            Calculated via standard Pearson Product-Moment formula over {activePair.corr.sampleSize} verified records.
          </div>
        </div>
      </div>

      {/* Grid of all 7 Factor Correlations for fast scanning */}
      <div className="space-y-4">
        <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">Summary Matrix of All 7 EDA Relationships</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {factorPairs.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPair(p.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                selectedPair === p.id
                  ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-500 shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-brand-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{p.title}</span>
                <span className="text-sm font-black text-brand-600 dark:text-brand-400">r = {p.corr.r}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                {p.corr.interpretation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
