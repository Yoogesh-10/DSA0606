import React from 'react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_RISK_WEIGHTS } from '../../utils/dataScience';
import { Settings as SettingsIcon, Sliders, RotateCcw, Check, Shield, Database } from 'lucide-react';

export const SettingsView = () => {
  const {
    riskWeights,
    setRiskWeights,
    globalFilters,
    setGlobalFilters,
    resetToSampleDataset
  } = useApp();

  const handleWeightChange = (key, val) => {
    setRiskWeights(prev => ({ ...prev, [key]: Number(val) }));
  };

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-brand-600" />
          <span>System Parameters & Engine Configuration</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Customize risk scoring model weights, academic thresholds, and institutional parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Weights Settings */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-brand-600" />
              <span>Risk Score Factor Weights (%)</span>
            </h4>
            <button
              onClick={() => setRiskWeights(DEFAULT_RISK_WEIGHTS)}
              className="text-xs text-brand-600 font-bold hover:underline"
            >
              Reset to Defaults
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span>Attendance Weight</span>
                <span>{riskWeights.attendance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={riskWeights.attendance}
                onChange={(e) => handleWeightChange('attendance', e.target.value)}
                className="w-full accent-brand-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span>Internal Marks Weight</span>
                <span>{riskWeights.internalMarks}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={riskWeights.internalMarks}
                onChange={(e) => handleWeightChange('internalMarks', e.target.value)}
                className="w-full accent-brand-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span>Assignment Score Weight</span>
                <span>{riskWeights.assignmentScore}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={riskWeights.assignmentScore}
                onChange={(e) => handleWeightChange('assignmentScore', e.target.value)}
                className="w-full accent-brand-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span>Previous Performance Weight</span>
                <span>{riskWeights.previousPerformance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={riskWeights.previousPerformance}
                onChange={(e) => handleWeightChange('previousPerformance', e.target.value)}
                className="w-full accent-brand-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span>Performance Trend Weight</span>
                <span>{riskWeights.performanceTrend}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={riskWeights.performanceTrend}
                onChange={(e) => handleWeightChange('performanceTrend', e.target.value)}
                className="w-full accent-brand-600"
              />
            </div>
          </div>
        </div>

        {/* Academic Configuration & Data Reset */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Academic Thresholds & Reset</span>
          </h4>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Attendance Warning Threshold (%)</label>
              <input
                type="number"
                defaultValue={75}
                className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Passing Grade Cutoff (%)</label>
              <input
                type="number"
                defaultValue={50}
                className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Max Internal Marks</label>
              <input
                type="number"
                defaultValue={100}
                className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="font-bold text-red-600 dark:text-red-400 block">Dataset Management</span>
              <button
                onClick={resetToSampleDataset}
                className="w-full py-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 border border-red-200 dark:border-red-900/60 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Application to Default Sample Dataset</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
