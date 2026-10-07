import React, { useState, useEffect } from 'react';
import {
  BarChart3, CheckCircle2, ShieldCheck, Activity, Users,
  TrendingUp, RefreshCw, AlertCircle, EyeOff
} from 'lucide-react';
import { fetchStatistics } from '../services/api';

export default function StatisticsView() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetchStatistics();
      setStats(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
        Calculating clinical statistics and performance indicators...
      </div>
    );
  }

  const {
    total_cases = 0,
    approved_cases = 0,
    pending_cases = 0,
    average_confidence = 0,
    average_quality_score = 0,
    doctor_agreement_rate = 0,
    total_findings_validated = 0,
    total_artifacts_suppressed = 0,
    pathology_distribution = {},
    benchmark_accuracy = {}
  } = stats;

  const totalPathologies = Object.values(pathology_distribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Clinical Performance Analytics & Statistics
          </h2>
          <p className="text-xs text-slate-500">
            Real-time quality indicators, physician concordance, and anti-hallucination metrics
          </p>
        </div>

        <button
          onClick={loadStats}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Cases Processed</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{total_cases}</span>
            <span className="text-[11px] text-slate-400">Analyses</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2">
            {approved_cases} Approved • {pending_cases} In Review
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Physician Agreement</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {doctor_agreement_rate}%
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold">Concordance</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2">
            Physician validation rate across all findings
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Mean AI Confidence</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
              {average_confidence}%
            </span>
            <span className="text-[11px] text-slate-400">Calibrated</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2">
            Expected Calibration Error: {benchmark_accuracy.calibration_error}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Avg Technical Quality</span>
            <Activity className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
              {average_quality_score}/100
            </span>
            <span className="text-[11px] text-cyan-600 font-semibold">IQA Index</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2">
            Laplacian sharpness + Contrast evaluation
          </div>
        </div>
      </div>

      {/* Anti-Hallucination & Evidence Validation Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Anti-Hallucination & Safety Gate Statistics
            </h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            MedVision AI's evidence-validation layer automatically assesses candidate visual anomalies against patient vitals and image-quality thresholds, suppressing uncorroborated artifacts.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-3.5 rounded-xl">
              <span className="text-[11px] text-emerald-600 font-medium block">Validated Findings</span>
              <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                {total_findings_validated}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Cross-modally corroborated</span>
            </div>

            <div className="bg-rose-500/5 border border-rose-500/20 p-3.5 rounded-xl">
              <span className="text-[11px] text-rose-600 font-medium block">Artifacts Suppressed</span>
              <span className="text-2xl font-bold font-mono text-rose-700 dark:text-rose-300">
                {total_artifacts_suppressed}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Prevented false positives</span>
            </div>
          </div>
        </div>

        {/* Pathology Frequency Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            Observed Pathology Distribution
          </h3>

          <div className="space-y-2.5 pt-1">
            {Object.entries(pathology_distribution).map(([pat, count]) => {
              const pct = Math.round((count / totalPathologies) * 100);
              return (
                <div key={pat} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[220px]">
                      {pat}
                    </span>
                    <span className="font-mono text-slate-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
